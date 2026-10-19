<?php

namespace App\Http\Controllers;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    public function setup(Request $request)
    {
        $user = $request->user();
        $google2fa = app(Google2FA::class);
        $secret = $google2fa->generateSecretKey();

        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_confirmed' => false,
        ]);

        $otpUrl = $google2fa->getQRCodeUrl(
            config('app.name', 'System Integration App'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(220),
            new SvgImageBackEnd(),
        );
        $writer = new Writer($renderer);
        $svg = $writer->writeString($otpUrl);

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => 'data:image/svg+xml;base64,' . base64_encode($svg),
            'message' => 'Scan the QR code in your authenticator app to finalize MFA setup.',
        ]);
    }

    public function verify(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'code' => ['required', 'string', 'digits:6'],
        ])->validate();

        $user = $request->user();

        if (empty($user->two_factor_secret)) {
            return response()->json([
                'message' => 'MFA setup has not been started yet.',
            ], 400);
        }

        $isValid = app(Google2FA::class)->verifyKey($user->two_factor_secret, $validated['code']);

        if (! $isValid) {
            return response()->json([
                'message' => 'Invalid MFA code.',
            ], 422);
        }

        $user->update([
            'two_factor_confirmed' => true,
        ]);

        return response()->json([
            'message' => 'MFA verification successful. Your account is protected with an extra layer of security.',
        ]);
    }
}
