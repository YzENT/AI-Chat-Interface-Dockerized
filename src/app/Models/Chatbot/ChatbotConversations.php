<?php

namespace App\Models\Chatbot;

use Illuminate\Database\Eloquent\Model;

class ChatbotConversations extends Model {
    
    protected $table = 'chatbot_conversations';
    protected $primaryKey = 'conversation_id';

    protected $fillable = [
        'user_id',
        'user_name',
        'title',
    ];

}