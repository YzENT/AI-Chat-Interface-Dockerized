<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Validation\ValidationException;
use App\Models\Chatbot\PromptTraining;
use App\Models\Chatbot\UrlCrawling;
use Illuminate\Support\Facades\DB;

class ChatbotService {
    protected $client;

    public function __construct() {
        $this->client = new Client();
    }

    // Local (phpmyadmin) functions

    public function getPrompts($userId) {
        try {
            $data = PromptTraining::where('prompted_by_id', $userId)
                    ->orderBy('prompt_id', 'desc')
                    ->get();

            return [
                'success' => true,
                'prompts' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getCrawledURLs($userId) {
        try {
            $data = UrlCrawling::where('crawled_by_id', $userId)
                    ->orderBy('crawl_id', 'desc')
                    ->get();

            return [
                'success' => true,
                'crawled' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function uploadPrompt($userId, $prompt) {
        try {
            $result = DB::transaction(function () use ($userId, $prompt) {

                $add_prompt = PromptTraining::create([
                    'prompt' => $prompt,
                    'prompted_by_id' => $userId,
                ]);

                $jarvis_add_prompt = $this->uploadPromptToJarvis($prompt);

                if (!$jarvis_add_prompt['success']) {
                    throw new \Exception ($jarvis_add_prompt['error']);
                }
                return [
                    'internal' => $add_prompt,
                    'external' => $jarvis_add_prompt,
                ];

            });

            return [
                'success' => true,
                'data' => $result,
            ];
        } catch (\Exception $e) {
            // DB will rollback in case of any failures, keeping jarvis and local server in sync
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function uploadCrawlURL($userId, $url) {
        try {

            $result = DB::transaction(function () use ($userId, $url) {

                $add_crawl_url = UrlCrawling::create([
                    'url' => $url,
                    'crawled_by_id' => $userId,
                ]);

                $jarvis_crawl_url = $this->uploadCrawlURLToJarvis($url);

                if (!$jarvis_crawl_url['success']) {
                    throw new \Exception ($jarvis_crawl_url['error']);
                }
                return [
                    'internal' => $add_crawl_url,
                    'external' => $jarvis_crawl_url,
                ];
            });

            return [
                'success' => true,
                'data' => $result,
            ];
        } catch (\Exception $e) {
            // DB will rollback in case of any failures, keeping jarvis and local server in sync
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    // Jarvis Requests POST/GET

    private function jarvisApi_POST($endpoint, array $payload) {
        try {
            $response = $this->client->request('POST', env('JARVIS_API_URL') . $endpoint, [
                'json' => $payload
            ]);
            
            $data = json_decode($response->getBody()->getContents());
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('JSON decode error: ' . json_last_error_msg());
            }
            
            return [
                'success' => true,
                'data' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function jarvisApi_GET($endpoint) {
        try {
            $response = $this->client->request('GET', env('JARVIS_API_URL') . $endpoint, []);
            
            $data = json_decode($response->getBody()->getContents());
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('JSON decode error: ' . json_last_error_msg());
            }
            
            return [
                'success' => true,
                'data' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    // Jarvis Functions

    public function askJarvis($userID, $prompt) {

        $result = $this->jarvisApi_POST('/ask', [
            'prompt' => $prompt,
        ]);
        $result['data']->response = preg_replace('/<think>.*?<\/think>/s', '', $result['data']->response);

        return $result;
    }

    public function getJarvisKnowledge() {
        return $this->jarvisApi_GET('/knowledge');
    }

    private function uploadPromptToJarvis($prompt) {
        return $this->jarvisApi_POST('/train', [
            'content' => $prompt,
        ]);
    }

    private function uploadCrawlURLToJarvis($url) {
        return $this->jarvisApi_POST('/crawl', [
            'url' => $url,
        ]);
    }

}
