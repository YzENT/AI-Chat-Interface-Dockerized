<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Http\Requests\Chatbot\AskRequest;
use App\Http\Requests\Chatbot\TrainRequest;
use App\Http\Requests\Chatbot\CrawlRequest;
use App\Http\Requests\AdminRequest;
use App\Services\ChatbotService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class ChatbotController extends BaseController {

    protected $chatbotService;

    public function __construct(ChatbotService $chatbotService) {
        $this->chatbotService = $chatbotService;
    }

    public function askQuestion(AskRequest $request): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->chatbotService->askJarvis($user->id, $request->prompt);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            $response_data = $response['data'];

            // Remove <think> </think> tags from chatbot response
            $cleanedResponse = preg_replace('/<think>.*?<\/think>/s', '', $response_data->response);
            $cleanedResponse = trim($cleanedResponse);

            return response()->json([
                'success' => true,
                'data' => [
                    'response' => $cleanedResponse,
                    'sources' => $response_data->sources ?? '',
                    'confidence' => $response_data->confidence ?? '',
                    // 'similarity' => isset($response_data->similarity) ? round($response_data->similarity, 2) : null,
                ],
                'msg' => 'Chatbot responded.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => "An error has occured, please try asking again later.",
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function getKnowledge(AdminRequest $request): JsonResponse {
        try {
            $response = $this->chatbotService->getJarvisKnowledge();

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'pagination' => $response['data']->pagination,
                    'knowledge' => $response['data']->data,
                ],
                'msg' => 'Chatbot knowledge obtained.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to load knowledges for chatbot, please try again later.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function uploadPrompt(TrainRequest $request): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->chatbotService->uploadPrompt($user->id, $request->prompt);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => 'Prompt added successfully!',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to upload prompt to chatbot, please try again later.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function getPrompts(AdminRequest $request) {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->chatbotService->getPrompts($user->id);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'count' => $response['prompts']->count(),
                'data' => [
                    'added_prompts' => $response['prompts'],
                ],
                'msg' => 'Previously added prompts obtained.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to obtain prompts from chatbot, please try again later.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function uploadCrawlURL(CrawlRequest $request): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->chatbotService->uploadCrawlURL($user->id, $request->url);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => 'URL crawled successfully!',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to upload specified URL to chatbot, please try again later.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function getCrawledURLs(AdminRequest $request) {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->chatbotService->getCrawledURLs($user->id);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'count' => $response['crawled']->count(),
                'data' => [
                    'added_crawl' => $response['crawled'],
                ],
                'msg' => 'Previously crawled URL\'s obtained.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to obtain URLs from chatbot, please try again later.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

}