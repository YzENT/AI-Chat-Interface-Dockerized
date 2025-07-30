<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest {

    public function authorize() {
        return true;
    }

    // If authorize() passes, only run rules function
    public function rules(): array {
        return [
            'email' => 'required|email',
            'password' => 'required',
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
