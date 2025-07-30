<?php

namespace App\Models\DocumentHandler;

use Illuminate\Database\Eloquent\Model;

class DocInternalList extends Model 
{
    protected $table = 'doc_internal_list';

    protected $fillable = [
        'file_id',
        'file_path',
    ];

    public $timestamps = false;

    public function file() {
        return $this->belongsTo(FileMetadata::class, 'file_id', 'file_id');
    }

}