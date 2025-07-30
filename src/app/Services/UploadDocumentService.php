<?php

namespace App\Services;

use App\Models\DocumentHandler\FileMetadata;
use App\Models\DocumentHandler\DocFaqList;
use App\Models\DocumentHandler\DocInternalList;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;

class UploadDocumentService {

    public function saveFile($file, $documentType, $userId) {

        $fileName = now()->format('Ymd_His') . '_' . $file->getClientOriginalName();
        $directory = config("file_upload.upload_path." . strtolower($documentType));
        $filePath = $file->storeAs($directory, $fileName, 'public');
        $fileExtension = $file->getClientOriginalExtension();
        $fileSize_bytes = $file->getSize();

        try {
            // Database transaction - only DB operations
            $result = DB::transaction(function () use ($filePath, $documentType, $userId, $fileName, $fileExtension, $fileSize_bytes, $file) {
                
                // Create and assign the FileMetadata
                $fileMetadata = FileMetadata::create([
                    'doc_name' => $fileName,
                    'doc_type' => $fileExtension,
                    'size_KB' => round($fileSize_bytes / 1000, 1),
                    'FAQ_INTERNAL' => ($documentType === 'FAQ') ? 'FAQ' : 'INTERNAL',
                    'uploaded_by_id' => $userId,
                ]);

                if ($documentType === 'FAQ') {
                    DocFaqList::create([
                        'file_id' => $fileMetadata->file_id,
                        'file_path' => storage_path('app/public/' . $filePath),
                    ]);
                } elseif ($documentType === 'Internal') {
                    DocInternalList::create([
                        'file_id' => $fileMetadata->file_id,
                        'file_path' => storage_path('app/public/' . $filePath),
                    ]);
                } else {
                    throw new \Exception('Document Type not specified!');
                }

                $jarvis_upload = $this->uploadToMarketingSystem($file);

                if (!$jarvis_upload['success']) {
                    throw new \Exception ($jarvis_upload['error']);
                }

                return [
                    'fileMetadata' => $fileMetadata,
                    'jarvis_data' => $jarvis_upload,
                ];
            });

        return [
            'success' => true,
            'fileMetadata' => $result['fileMetadata'],
            'jarvis_data' => $result['jarvis_data'],
        ];
            
        } catch (\Exception $e) {
            if ($filePath) {
                Storage::disk('public')->delete($filePath);
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function uploadToMarketingSystem($file) {

        try {
            $client = new Client();

            $response = $client->request('POST', env('JARVIS_API_URL') . '/upload', [
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => fopen($file->getPathname(), 'r'),
                        'filename' => $file->getClientOriginalName(),
                    ]
                ]
            ]);

            $data = json_decode($response->getBody()->getContents());

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('JSON decode error: ' . json_last_error_msg());
            }

            return [
                'success' => true,
                'data_jarvis_server' => $data,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}