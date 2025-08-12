<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;
use App\Http\Requests\LoginRequest;

class LoginController extends BaseController {

    public function login (LoginRequest $request) {

        // Rate limiting to prevent brute force attacks
        $key = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'msg' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ], 429);
        }

        // Maybe build 'remember me' option, just leave it as of now
        $remember = $request->has('remember');
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {

            // Disabled for development
            // Increment rate limiter on failed attempt
            // RateLimiter::hit($key, 300); // 5 minutes lockout

            return response()->json([
                'success' => false,
                'msg' => 'The provided credentials are incorrect.',
            ], 401);
        }
        
        try {
            // Revoke old tokens first (security best practice)
            $user->tokens()->each(function ($token) {
                $token->revoke();
            });

            $token = $user->createToken('authToken')->accessToken;

            // Clear Rate Limiter on successful login
            RateLimiter::clear($key);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
                'msg' => 'Login successful!'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('User failed to login', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'msg' => 'There was an error signing you in. Please try again later.',
            ], 500);
        }
    }
}