<?php

namespace App\Http\Controllers\User;
use App\Http\Controllers\BaseController;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class ProfileController extends BaseController {

    protected $profileService;

    public function __construct(ProfileService $profileService) {
        $this->profileService = $profileService;
    }

    public function getProfileDetails(): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->profileService->getDetails($user->id);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'data' => $response['user_data'],
                'msg' => 'User details obtained!',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to obtain profile details.',
                'debug' => config('app.debug') ? 
                [
                    'debug_msg' => $e->getMessage(),
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function updateProfileDetails(UpdateProfileRequest $request): JsonResponse {
        try {
            $user = $this->getAuthenticatedUser();
            $response = $this->profileService->updateDetails($user->id, $request->name, $request->email);

            if (!$response['success']) {
                throw new \Exception ($response['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => 'User details updated!',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Failed to update profile details.',
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

}