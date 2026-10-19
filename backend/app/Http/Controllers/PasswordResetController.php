<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ])->validate();

        $user = User::where('email', strtolower($validated['email']))->first();
        $token = Str::random(60);

        if ($user) {
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => hash('sha256', $token),
                    'created_at' => now(),
                ],
            );
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return response()->json([
            'message' => 'If the email is registered, a reset link has been generated.',
            'reset_url' => $frontendUrl . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode(strtolower($validated['email'])),
            'token' => $token,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ])->validate();

        $record = DB::table('password_reset_tokens')
            ->where('email', strtolower($validated['email']))
            ->where('token', hash('sha256', $validated['token']))
            ->first();

        if (! $record || now()->diffInMinutes($record->created_at) > 60) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
            ], 400);
        }

        $user = User::where('email', strtolower($validated['email']))->first();

        if (! $user) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
            ], 400);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        DB::table('password_reset_tokens')->where('email', strtolower($validated['email']))->delete();

        return response()->json([
            'message' => 'Password reset successful. You can now log in with your new password.',
        ]);
    }
}
