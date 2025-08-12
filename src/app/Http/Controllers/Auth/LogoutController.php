<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;

class LogoutController extends BaseController {

    public function logout(Request $request) {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return response()->json([
                'success' => false,
                'msg' => "Logout Unsuccessful. How did you get here without an authentication token?",
            ], 401);
        }

        try {
            $user->tokens()->each(function ($token) {
                $token->revoke();
            });

            return response()->json([
                'success' => true,
                'msg' => 'Logout successful!'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('User failed to logout', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'msg' => 'There was an error signing you out. Please try again later.',
            ], 500);
        }
    }

}