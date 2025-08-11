<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Services\ChatbotMessageService;
use App\Http\Requests\Chatbot\ChatbotMessageRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class ChatbotMessageController extends BaseController {

    protected $chatbotMessageService;

    public function __construct(ChatbotMessageService $chatbotMessageService) {
        $this->chatbotMessageService = $chatbotMessageService;
    }

    public function getLatestConvo(): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $fetchConvoID = $this->chatbotMessageService->getUserLatestConvoID($user->id);

            if (!$fetchConvoID['success']) {
                throw new \Exception ($fetchConvoID['error']);
            }

            // Have to return early, because entire thing will be null
            // Cannot index conversation_id because object doesn't even exist
            if (!$fetchConvoID['latest_convo_entry']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'convo_messages' => null,
                    ],
                    'msg' => 'No conversation history found.',
                ], 200);
            }

            $latest_convo_id = $fetchConvoID['latest_convo_entry']->conversation_id;
            $fetchConvoMessages = $this->chatbotMessageService->getConvoMessages($latest_convo_id);

            if (!$fetchConvoMessages['success']) {
                throw new \Exception ($fetchConvoMessages['error']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'convo_messages' => $fetchConvoMessages['convo_messages'],
                ],
                'msg' => 'Latest conversation history obtained successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to fetch most recent conversation with chatbot.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response_convoID' => $fetchConvoID ?? null,
                    'debug_response_getMessages' => $fetchConvoMessages ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function createNewConvo(ChatbotMessageRequest $request) {
        try {
            $user = $this->getAuthenticatedUser();
            $createNewConvo = $this->chatbotMessageService->createNewConvo($user->id, $user->name, $request->message);

            if (!$createNewConvo['success']) {
                throw new \Exception ($createNewConvo['error']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'convo_id' => $createNewConvo['new_convo']->conversation_id,
                ],
                'msg' => 'New conversation created and stored in system.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to store conversation to system.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $createNewConvo ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function appendExistingConvo(ChatbotMessageRequest $request, $convoID) {
        try {
            $user = $this->getAuthenticatedUser();
            $addMessageToConvo = $this->chatbotMessageService->addConvoMessages($convoID, $request->message, $request->sender_type);

            if (!$addMessageToConvo['success']) {
                throw new \Exception ($addMessageToConvo['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => 'Conversation extended.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to extend conversation.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $createNewConvo ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

}