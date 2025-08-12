<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Controllers\BaseController;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use App\Services\UploadDocumentService;

class UploadDocumentController extends BaseController {

    protected $uploadDocumentService;

    public function __construct(UploadDocumentService $uploadDocumentService) {
        $this->uploadDocumentService = $uploadDocumentService;
    }

    public function uploadFAQ(UploadDocumentRequest $request) {
        return $this->handleFileUpload($request, 'FAQ');
    }

    public function uploadInternal(UploadDocumentRequest $request) {
       return $this->handleFileUpload($request, 'Internal');
    }

    private function handleFileUpload(Request $request, string $documentType) {
        try {
            $user = $this->getAuthenticatedUser();
            $result = $this->uploadDocumentService->saveFile($request->file('file'), $documentType, $user->id);

            if (!$result['success']) {
                throw new \Exception ($result['error']);
            }

            return response()->json([
                'success' => true,
                'msg' => "$documentType File uploaded successfully!",
            ], 201);

        } catch (\Exception $e) {
            \Log::error("Failed to upload document type: ${documentType}", ['exception' => $e]);
            return response()->json([
                'success' => false,
                'msg' => 'Failed to upload file to servers.',
            ], 500);
        }
    }
}