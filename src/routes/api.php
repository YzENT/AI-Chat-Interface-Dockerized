<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\UploadDocumentController;
use App\Http\Controllers\Api\GetFAQController;
use App\Http\Controllers\Api\GetDocumentController;
use App\Http\Controllers\Api\WatiController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\AccountVerificationController;
use App\Http\Controllers\User\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Testing
Route::get('/ping', function () {
    return response()->json([
        'status' => 'success', 
        'message' => 'API is working',
        'timestamp' => now()
    ]);
});

Route::middleware('auth:api')->group(function() {
    Route::get('/ping_admin', function () {
        return response()->json([
            'status' => 'success', 
            'message' => 'API is working',
            'timestamp' => now()
        ]);
    });
});



// Public routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/chatbot/ask', [ChatbotController::class, 'askQuestion']);

// Route for WATI's Webhook
Route::post('/wati/webhook/{vendor_name}', [WatiController::class, 'handle']);

// Verify user
Route::get('/verify-user', [AccountVerificationController::class, 'verifyUser']);
Route::get('/verify-admin', [AccountVerificationController::class, 'verifyAdmin']);

Route::middleware('auth:api')->group(function () {
    // --------------------
    // ---User functions---
    // --------------------
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/profile/get-details', [ProfileController::class, 'getProfileDetails']);
    Route::post('/profile/update', [ProfileController::class, 'updateProfileDetails']);
});

Route::middleware(['auth:api', 'admin'])->group(function () {
    // --------------------
    // --Admin functions---
    // --------------------

    // WATI hidden functions
    // Construction
    Route::post('/wati/update/{watiID}', [WatiController::class, 'updateVendorInfoWATI']);
    Route::get('/wati/get', [WatiController::class, 'getActiveAPI']);
    Route::post('/wati/delete/{watiID}', [WatiController::class, 'deleteVendorAPI']);
    Route::post('/wati/create', [WatiController::class, 'createVendorAPI']);

    // Uploading Documents
    // Names at the back are for App\Http\Requests\UploadDocumentRequest.php
    Route::post('/docs/upload/faq', [UploadDocumentController::class, 'uploadFAQ'])->name('upload.faq');
    Route::post('/docs/upload/internal', [UploadDocumentController::class, 'uploadInternal'])->name('upload.internal');
    Route::get('/docs/upload/get-config', function () {
        return response()->json(Config::get('file_upload'));
    });

    // Fetching document list
    Route::get('/docs/get/faq', [GetDocumentController::class, 'getFAQ_docs']);
    Route::get('/docs/get/internal', [GetDocumentController::class, 'getInternal_docs']);

    // Download document
    Route::get('/docs/download/{fileId}', [GetDocumentController::class, 'downloadDocument']);

    // Advanced chatbot utilities
    Route::get('/chatbot/knowledge', [ChatbotController::class, 'getKnowledge']);
    Route::post('/chatbot/prompt/upload', [ChatbotController::class, 'uploadPrompt']);
    Route::get('/chatbot/prompt/get', [ChatbotController::class, 'getPrompts']);
    Route::post('/chatbot/crawl/upload', [ChatbotController::class, 'uploadCrawlURL']);
    Route::get('/chatbot/crawl/get', [ChatbotController::class, 'getCrawledURLs']);

});