import React, { useEffect, useRef, useState } from 'react';
import '../../../../css/sidebar/admin/GetFilePage.css';
import {toast} from "react-toastify";
import { FileText, Download, Calendar, HardDrive, FileSpreadsheet } from 'lucide-react';

export default function GetFilePage() {

    const [documents, setDocuments] = useState([]);
    const [documentListLoading, setDocumentListLoading] = useState(true);
    const [downloadingFiles, setDownloadingFiles] = useState(new Set());
    const [documentType, setDocumentType] = useState('faq'); // Defaults to FAQ
    const [count, setCount] = useState(0);
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
    }, []);

    // Listens to documentType and fetches list accordingly
    useEffect(() => {
        fetchDocuments();
    }, [documentType]);

    const fetchDocuments = async () => {
        try {
            setDocumentListLoading(true);
            const response = await fetch('/api/docs/' + documentType, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            setDocuments(responseData.data);
            setCount(responseData.count);
        } catch (error) {
            setDocuments([]);
            setCount(0);
            toast.error(error.message || 'Failed to obtain data from server.');
        } finally {
            setDocumentListLoading(false);
        }
    };

    const formatFileSize = (sizeKB) => {
        if (sizeKB < 1024) {
            return `${sizeKB.toFixed(1)} KB`;
        } else {
            return `${(sizeKB / 1024).toFixed(1)} MB`;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (docType) => {
        if (docType === 'pdf' || docType === 'txt' || docType === 'docx') {
            return <FileText size={20} className="text-blue-400" />;
        } else if (docType === 'xlsx' || docType === 'csv') {
            return <FileSpreadsheet size={20} className="text-blue-400" />;
        }
    };

    const handleDownload = async (fileID, fileName) => {
        try {
            setDownloadingFiles(prev => new Set([...prev, fileID]));
            const response = await fetch('/api/docs/' + fileID, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            if (!response.ok) {
                const responseJSON = await response.json();
                throw new Error(responseJSON.msg);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            toast.error(error.message || 'Failed to download file from server.');
        } finally {
            setDownloadingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileID);
                return newSet;
            });
        }
    };

    return (
        <div className="docs-view-page">
            <div className="docs-header">
                <h1 className="docs-title">Documents</h1>
                <div className="docs-type-selector">
                <button 
                    className={`type-button ${documentType === 'faq' ? 'active' : ''}`}
                    onClick={() => setDocumentType('faq')}
                >
                    FAQ
                </button>
                <button 
                    className={`type-button ${documentType === 'internal' ? 'active' : ''}`}
                    onClick={() => setDocumentType('internal')}
                >
                    Internal
                </button>
                </div>
            </div>

            <div className="docs-body">
                <div className="docs-container">
                    <div className="docs-summary">
                        <h2 className="docs-section-title">
                        {documentType.toUpperCase()} Documents ({count})
                        </h2>
                    </div>

                    {documentListLoading ? (
                        <div className="docs-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="docs-empty">
                            <FileText size={48} className="text-gray-500" />
                            <p>No {documentType} documents uploaded yet.</p>

                            <button 
                                type="button"
                                className="link-upload-page-button"
                                onClick = {() => window.location.href = '/docs/upload'}
                            >
                                Start Uploading!
                            </button>
                        </div>
                    ) : (
                        <div className="docs-grid">
                        {documents.map((doc) => (
                            <div key={doc.file_id} className="doc-card">
                                <div className="doc-header">
                                    <div className="doc-icon">
                                        {getFileIcon(doc.doc_type)}
                                    </div>
                                    <div className="doc-info">
                                        <h3 className="doc-name">{doc.doc_name}</h3>
                                        <p className="doc-type">{doc.doc_type.toUpperCase()}</p>
                                    </div>
                                    <button 
                                        className="doc-download"
                                        onClick={() => handleDownload(doc.file_id, doc.doc_name)}
                                        title="Download"
                                        disabled={downloadingFiles.has(doc.file_id)}
                                    >
                                        {downloadingFiles.has(doc.file_id) ? (
                                            <>
                                                <div className="loading-spinner"></div>
                                            </>
                                        ) : (
                                            <Download size={16} />
                                        )}
                                    </button>
                                </div>
                                
                                <div className="doc-details">
                                    <div className="doc-detail">
                                        <HardDrive size={16} />
                                        <span>{formatFileSize(doc.size_KB)}</span>
                                    </div>
                                    <div className="doc-detail">
                                        <Calendar size={16} />
                                        <span>{formatDate(doc.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}