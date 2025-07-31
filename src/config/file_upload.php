<?php
return [
    'max_size_kb' => 100000,
    'allowed_types' => [
        'faq' => ['txt', 'pdf', 'docx'],
        'internal' => ['txt', 'pdf', 'docx', 'csv', 'xlsx'],
    ],
    // Directory
    'upload_path' => [
        'faq' => 'uploads/faq',
        'internal' => 'uploads/internal',
    ]
];