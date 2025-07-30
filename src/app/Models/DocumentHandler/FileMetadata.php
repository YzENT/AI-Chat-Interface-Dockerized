<?php

namespace App\Models\DocumentHandler;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FileMetadata extends Model{

    use SoftDeletes;
    protected $table = 'file_metadata';
    protected $primaryKey = 'file_id';

    protected $fillable = [
        'doc_name',
        'doc_type',
        'size_KB',
        'FAQ_INTERNAL',
        'uploaded_by_id',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function faqs() {
        return $this->hasMany(DocFaqList::class, 'file_id', 'file_id');
    }

    public function internals() {
        return $this->hasMany(DocInternalList::class, 'file_id', 'file_id');
    }
    
}