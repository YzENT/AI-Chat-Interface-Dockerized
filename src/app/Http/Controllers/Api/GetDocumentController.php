<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\AdminRequest;
use App\Services\GetDocumentService;
use App\Http\Controllers\BaseController;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;

class GetDocumentController extends BaseController {

    protected $getDocumentService;

    public function __construct(GetDocumentService $getDocumentService) {
        $this->getDocumentService = $getDocumentService;
    }

    public function getInternal_docs(AdminRequest $request) {
        return $this->getDocumentList('INTERNAL');
    }

    public function getFAQ_docs(AdminRequest $request) {
        return $this->getDocumentList('FAQ');
    }

    private function getDocumentList(string $documentType) {
        try {
            $user = $this->getAuthenticatedUser();
            $result = $this->getDocumentService->getDocumentList($documentType, $user->id);

            if (!$result['success']) {
                throw new \Exception ($result['error']);
            }

            return response()->json([
                'success' => true,
                'count' => $result['doc_list']->count(),
                'data' => $result['doc_list'],
                'msg' => "Successfully in obtaining all ${documentType} documents uploaded by current user.",
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => $e->getMessage(),
                'debug' => config('app.debug') ? 
                [
                    'debug_response' => $result,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }

    public function downloadDocument(AdminRequest $request, $fileID) {
        try {
            $user = $this->getAuthenticatedUser();
            $result = $this->getDocumentService->downloadDocument($fileID, $user->id);

            if (!$result['success']) {
                throw new \Exception ($result['error']);
            }

            $filePath = $result['file_path'];
            $fileName = $result['file_name'];
            if (!file_exists($filePath)) {
                throw new \Exception ('File not found on server!');
            }

            return response()->download($filePath, $fileName);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => $e->getMessage(),
                'debug' => config('app.debug') ? 
                [
                    'debug_request' => $request,
                    'debug_response' => $response,
                ]
                 : 'App not in debug mode.',
            ], 500);
        }
    }
}