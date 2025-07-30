<?php

namespace App\Models\Chatbot;

use Illuminate\Database\Eloquent\Model;

class PromptTraining extends Model {
    
    protected $table = 'added_prompt_training';

    protected $fillable = [
        'prompt',
        'prompted_by_id',
    ];

}