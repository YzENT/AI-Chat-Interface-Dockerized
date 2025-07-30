<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\BaseController;
use Illuminate\Database\QueryException;
use App\Http\Requests\RegisterRequest;

class RegisterController extends BaseController {

    public function register (RegisterRequest $request) {

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'success' => true,
                'msg' => 'User has been successfully registered!',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'There was an error in account creation. Please try again later.',
                'debug' => config('app.debug') ? $e->getMessage(): 'App not in debug mode.',
            ], 500);
        }
    }
}