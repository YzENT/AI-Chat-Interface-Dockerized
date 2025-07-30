<?php

namespace App\Services;

use App\Models\DocumentHandler\FileMetadata;
use App\Models\DocumentHandler\DocFaqList;
use App\Models\DocumentHandler\DocInternalList;
use GuzzleHttp\Client;
use Illuminate\Validation\ValidationException;

class GetDocumentService {

    protected $client;

    public function __construct() {
        $this->client = new Client();
    }

    public function getDocumentList(string $documentType, int $userID) {
        try {
            $data = FileMetadata::where('uploaded_by_id', $userID)
                ->where('FAQ_INTERNAL', $documentType)
                ->get(['file_id', 'doc_name', 'doc_type', 'size_KB', 'created_at', 'updated_at']);

            return [
                'success' => true,
                'doc_list' => $data,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function downloadDocument(int $fileID, int $userID) {
        try {
            $fileMetadata = FileMetadata::where('file_id', $fileID)
                            ->where('uploaded_by_id', $userID)
                            ->first();

            if (!$fileMetadata) {
                throw new \Exception('File not found or access denied');
            }

            $fileRecord = null;
            if ($fileMetadata->FAQ_INTERNAL === 'FAQ') {
                $fileRecord = DocFaqList::where('file_id', $fileID)->first();
            } else if ($fileMetadata->FAQ_INTERNAL === 'INTERNAL') {
                $fileRecord = DocInternalList::where('file_id', $fileID)->first();
            } else {
                throw new \Exception ('File type not specified in FAQ_INTERNAL column.');
            }

            if (!$fileRecord) {
                throw new \Exception('Unable to retrieve file_path from database.');
            }

            return [
                'success' => true,
                'file_name' => $fileMetadata->doc_name,
                'file_path' => $fileRecord->file_path,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}