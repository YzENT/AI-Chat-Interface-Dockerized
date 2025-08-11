<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;
use App\Models\Chatbot\ChatbotMessages;
use App\Models\Chatbot\ChatbotConversations;

class ChatbotMessageService {

    public function __construct() {}

    public function getUserLatestConvoID($userID) {
        try {
            $data = ChatbotConversations::where('user_id', $userID)
                    ->orderBy('conversation_id', 'desc')
                    ->first();

            return [
                'success' => true,
                'latest_convo_entry' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getConvoMessages($convoID) {
        try {
            $data = ChatbotMessages::where('conversation_id', $convoID)
                    ->get();

            return [
                'success' => true,
                'convo_messages' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function addConvoMessages($convoID, $message, $sender_type) {
        try {
            $new_message = ChatbotMessages::create([
                'conversation_id' => $convoID,
                'message' => $message,
                'sender_type' => $sender_type,
            ]);

            return [
                'success' => true,
                'added_message' => $new_message,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function createNewConvo($userID, $user_name, $message) {
        try {
            $new_convo = ChatbotConversations::create([
                'user_id' => $userID,
                'user_name' => $user_name,
                'title' => $message,
            ]);

            $default_sender_type = "user"; // 'user' or 'assistant'
            $add_message = $this->addConvoMessages($new_convo->conversation_id, $message, $default_sender_type);

            if (!$add_message['success']) {
                throw new \Exception ($add_message['error']);
            }

            return [
                'success' => true,
                'new_convo' => $new_convo,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

}