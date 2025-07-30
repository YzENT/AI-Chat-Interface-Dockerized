<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminRequest extends FormRequest {

    public function authorize() {
        $user = auth('api')->user();
        return $user && $user->is_admin;
    }

}