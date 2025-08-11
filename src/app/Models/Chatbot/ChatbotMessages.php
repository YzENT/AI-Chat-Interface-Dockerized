<?php

namespace App\Models\Chatbot;

use Illuminate\Database\Eloquent\Model;

class ChatbotMessages extends Model {
    
    protected $table = 'chatbot_messages';

    protected $fillable = [
        'conversation_id',
        'message',
        'sender_type',
    ];

}