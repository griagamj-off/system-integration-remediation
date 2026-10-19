<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->makeHidden(['two_factor_secret']),
            'map' => [
                'provider' => 'OpenStreetMap',
                'center' => [
                    'lat' => 14.5995,
                    'lng' => 120.9842,
                ],
                'label' => 'Metro Manila, Philippines',
            ],
            'weather' => [
                'location' => 'Metro Manila',
                'temperature_c' => 29.5,
                'condition' => 'Partly cloudy',
                'icon' => 'partly_cloudy',
                'source' => 'OpenWeatherMap (demo fallback)',
            ],
        ]);
    }
}
