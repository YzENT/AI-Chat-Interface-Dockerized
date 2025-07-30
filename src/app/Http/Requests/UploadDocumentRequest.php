<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UploadDocumentRequest extends FormRequest {

    public function authorize() {
        $user = auth('api')->user();
        return $user && $user->is_admin;
    }

    // If authorize() passes, only run rules function
    public function rules(): array {
        $routeName = $this->route()->getName();
        $allowedTypesMap = config('file_upload.allowed_types');

        switch ($routeName) {
            case 'upload.internal':
                $allowedFileTypes = implode(',', $allowedTypesMap['internal']);
                break;
            case 'upload.faq':
                $allowedFileTypes = implode(',', $allowedTypesMap['faq']);
                break;
            default:
                $allowedFileTypes = 'txt, pdf';
                break;
        }

        return [
            'file' => [
                'required',
                'file',
                'max:' . config('file_upload.max_size_kb'),
                "extensions:$allowedFileTypes"
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