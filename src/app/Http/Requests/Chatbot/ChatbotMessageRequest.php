<?php

namespace App\Http\Requests\Chatbot;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ChatbotMessageRequest extends FormRequest {
    
    // Checks if user exist or not first
    public function authorize() {
        return auth('api')->user();
    }

    // If authorize() passes, only run rules function
    public function rules(): array {
        return [
            'message' => [
                'required',
                'string',
            ],
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
