<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest {

    public function authorize() {
        return true;
    }

    // If authorize() passes, only run rules function
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ];
    }

    // Handle validation failure in a separate method
    protected function failedValidation(Validator $validator) {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'data' => [],
                'msg' => $validator->errors()->first(),
            ], 422)
        );
    }
}
