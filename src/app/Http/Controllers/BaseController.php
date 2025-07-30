<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class BaseController extends Controller {
    // General validation method
    public function validateRequest(Request $request, array $rules)
    {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'msg' => $validator->errors()->first(),
            ], 422);
        }

        return null; // No validation errors
    }

    // Get the authenticated user
    public function getAuthenticatedUser() {
        return auth('api')->user();
    }
}