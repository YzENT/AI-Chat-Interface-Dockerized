<?php

namespace App\Models\Chatbot;

use Illuminate\Database\Eloquent\Model;

class UrlCrawling extends Model {
    
    protected $table = 'added_crawled_url';

    protected $fillable = [
        'url',
        'crawled_by_id',
    ];

}