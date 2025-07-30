<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\BaseController;

class AccountVerificationController extends BaseController {
    public function verifyUser(Request $request) {
        $user = auth('api')->user();
        return response()->json($user ? true : false);
    }

    public function verifyAdmin(Request $request) {
        $user = auth('api')->user();
        return response()->json($user && $user->is_admin);
    }
}
