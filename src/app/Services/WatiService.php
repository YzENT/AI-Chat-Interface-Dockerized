<?php

namespace App\Services;

use App\Models\Wati;
use GuzzleHttp\Client;
use Illuminate\Validation\ValidationException;

class WatiService {

    protected $client;

    public function __construct() {
        $this->client = new Client();
    }

    public function sendWhatsappMessage(string $messageToSend, string $phoneNumberToSend, string $vendor_name) {

        // WATI doesn't support json raw data anymore, have to send through URL
        $joined_url = "/api/v1/sendSessionMessage/${phoneNumberToSend}?messageText=${messageToSend}";

        try {
            $vendor_api = $this->getVendorAPIData($vendor_name);

            if (!$vendor_api['success']) {
                throw new \Exception($active_api['error']);
            }

            $response = $this->client->request('POST', $vendor_api['data']->api_url . $joined_url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $vendor_api['data']->api_token,
                    'Content-Type' => 'application/json',
                ]
            ]);

            $data = json_decode($response->getBody()->getContents());
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('JSON decode error: ' . json_last_error_msg());
            }

            // WATI's response
            if ($data->result === false) {
                throw new \Exception($data->message ?? $data->info ?? "An error has occured in WATI response");
            }

            return [
                'success' => true,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'debug' => $data ?? null,
            ];
        }
    }

    public function updateVendorAPIData(int $watiID, string $api_token, string $api_url, string $vendor_name, int $userID) {

        // Cannot use vendor_name to index, because it could be updated
        // Must use specific ID, need to handle it in front-end
        try {
            $vendor_api = Wati::find($watiID);
            
            if ($vendor_api) {
                $vendor_api->update([
                    'api_token' => $api_token,
                    'api_url' => $api_url,
                    'vendor_name' => $vendor_name,
                    'updated_by_user_id' => $userID,
                ]);
            } else {
                throw new \Exception("The ID: {$watiID} could not be found in database.");
            }

            return [
                'success' => true,
                'data' => $vendor_api,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getActiveAPI() {
        try {
            $wati = Wati::where('revoked', false)->get();

            return [
                'success' => true,
                'data' => $wati,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function removeVendorAPIData(int $watiID) {
        try {
            $vendor_api = Wati::find($watiID);
            
            if ($vendor_api) {
                $vendor_api->delete();
            } else {
                throw new \Exception("The ID: {$watiID} could not be found in database.");
            }

            return [
                'success' => true,
                'data' => $vendor_api,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function createVendorAPIData(string $api_token, string $api_url, string $vendor_name, int $userID) {
        try {
            $vendor_api = Wati::create([
                'api_token' => $api_token,
                'api_url' => $api_url,
                'vendor_name' => $vendor_name,
                'updated_by_user_id' => $userID,
            ]);

            return [
                'success' => true,
                'data' => $vendor_api,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getVendorAPIData(string $vendor_name) {
        try {
            $vendor_api = Wati::where('vendor_name', $vendor_name)
                            ->where('revoked', false)
                            ->first();
            
            if (!$vendor_api) {
                throw new \Exception("Vendor API data not found for vendor: {$vendor_name}");
            }

            return [
                'success' => true,
                'data' => $vendor_api,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}