<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wati extends Model {
    
    protected $table = 'wati_info';

    protected $fillable = [
        'api_token',
        'api_url',
        'vendor_name',
        'updated_by_user_id',
        'revoked',
    ];

    protected $casts = [
        'revoked' => 'boolean',
    ];

    protected $attributes = [
        'revoked' => false,
    ];

}