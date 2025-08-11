<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\AdminRequest;
use App\Services\ChatbotService;
use App\Services\WatiService;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class WatiController extends BaseController {

    protected $chatbotService;
    protected $watiService;

    public function __construct(ChatbotService $chatbotService, WatiService $watiService) {
        $this->chatbotService = $chatbotService;
        $this->watiService = $watiService;
        $this->defaultUserID = 0;
    }

    // Don't put WatiRequest here, webhook api needs to be accessible to public
    public function handle(Request $request, $vendor_name) {

        $validationError = $this->validateRequest($request, [
            'text' => 'required|string|max:4096',
            'waId' => 'required|string',
        ]);

        if ($validationError) {
            return $validationError;
        }

        try {
            // Check if URL exists first
            $vendor_api = $this->watiService->getVendorAPIData($vendor_name);

            if (!$vendor_api['success']) {
                throw new \Exception ($vendor_api['error']);
            }

            $ai_response = $this->chatbotService->askJarvis($this->defaultUserID, $request->text);

            if (!$ai_response['success']) {
                throw new \Exception ($ai_response['error']);
            }

            // Forward AI response using WATI
            $whatsapp_status = $this->watiService->sendWhatsappMessage($ai_response['data']->response, $request->waId, $vendor_api);

            if (!$whatsapp_status['success']) {
                throw new \Exception ($whatsapp_status['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => 'Message sent to user in whatsapp.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to send message through WATI.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_ai' => $ai_response ?? null,
                    'debug_whatsapp' => $whatsapp_status ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function updateVendorInfoWATI(AdminRequest $request, $watiID) {

        $validationError = $this->validateRequest($request, [
            'api_token' => 'required|string',
            'api_url' => 'required|string|url|max:255',
            'vendor_name' => 'required|string|max:255|unique:wati_info',
        ]);

        if ($validationError) {
            return $validationError;
        }

        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->watiService->updateVendorAPIData($watiID, $request->api_token, $request->api_url, $request->vendor_name, $user->id);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => "Successfully updated WATI configuration for {$request->vendor_name}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to update vendor information.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_response' => $response ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function getActiveAPI(AdminRequest $request) {
        try {
            $response = $this->watiService->getActiveAPI();

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'data' => $response['data'],
                'msg' => 'Active WATI information obtained.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to obtain WATI vendor list.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function deleteVendorAPI(AdminRequest $request, $watiID) {
        try {
            $response = $this->watiService->removeVendorAPIData($watiID);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => "Successfully removed WATI configuration.",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to delete WATI vendor information.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function createVendorAPI(AdminRequest $request) {
        $validationError = $this->validateRequest($request, [
            'api_token' => 'required|string',
            'api_url' => 'required|string|url|max:255',
            'vendor_name' => 'required|string|max:255|unique:wati_info',
        ]);

        if ($validationError) {
            return $validationError;
        }

        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->watiService->createVendorAPIData($request->api_token, $request->api_url, $request->vendor_name, $user->id);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => "Successfully created WATI configuration for {$request->vendor_name}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to create vendor API.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_request' => $request,
                    'debug_response' => $response ?? null,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }
}
