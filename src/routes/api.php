<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ChatbotMessageController;
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
    Route::get('/ping_verified', function () {
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
    Route::get('/profile', [ProfileController::class, 'getProfileDetails']);
    Route::post('/profile', [ProfileController::class, 'updateProfileDetails']);

    Route::get('/chatbot/convo', [ChatbotMessageController::class, 'getLatestConvo']);
    Route::post('/chatbot/convo/create', [ChatbotMessageController::class, 'createNewConvo']);
    Route::post('/chatbot/convo/{convoID}', [ChatbotMessageController::class, 'appendExistingConvo']);
    
});

Route::middleware(['auth:api', 'admin'])->group(function () {
    // --------------------
    // --Admin functions---
    // --------------------

    // WATI hidden functions
    Route::get('/wati', [WatiController::class, 'getActiveAPI']);
    Route::post('/wati', [WatiController::class, 'createVendorAPI']);
    Route::put('/wati/{watiID}', [WatiController::class, 'updateVendorInfoWATI']);
    Route::delete('/wati/{watiID}', [WatiController::class, 'deleteVendorAPI']);

    // Uploading Documents
    // Names at the back are for App\Http\Requests\UploadDocumentRequest.php
    Route::post('/docs/faq', [UploadDocumentController::class, 'uploadFAQ'])->name('upload.faq');
    Route::post('/docs/internal', [UploadDocumentController::class, 'uploadInternal'])->name('upload.internal');

    // Fetching document list
    Route::get('/docs/faq', [GetDocumentController::class, 'getFAQ']);
    Route::get('/docs/internal', [GetDocumentController::class, 'getInternal']);
    Route::get('/docs/config', function () {
        return response()->json(Config::get('file_upload'));
    });
    Route::get('/docs/{fileId}', [GetDocumentController::class, 'downloadDocument']);

    // Advanced chatbot utilities
    Route::get('/chatbot/knowledge', [ChatbotController::class, 'getKnowledge']);
    Route::post('/chatbot/prompt', [ChatbotController::class, 'uploadPrompt']);
    Route::get('/chatbot/prompt', [ChatbotController::class, 'getPrompts']);
    Route::post('/chatbot/crawl', [ChatbotController::class, 'uploadCrawlURL']);
    Route::get('/chatbot/crawl', [ChatbotController::class, 'getCrawledURLs']);

});