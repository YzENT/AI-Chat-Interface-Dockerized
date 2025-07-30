<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
});

Route::get('/login', function () {
    return view('Auth/login');
})->name('login');

Route::get('/register', function () {
    return view('Auth/register');
})->name('register');

Route::get('/wati', function () {
    return view('Admin/wati_configuration');
});

Route::get('/docs/upload', function () {
    return view('Admin/upload_file');
});

Route::get('/docs/get', function () {
    return view('Admin/get_file');
});

Route::get('/chatbot/train', function () {
    return view('Admin/prompt_training');
});

Route::get('/chatbot/knowledge', function () {
    return view('Admin/ai_knowledge');
});

Route::get('/chatbot/crawl', function () {
    return view('Admin/web_crawling');
});

Route::get('/profile', function () {
    return view('User/edit_profile');
});