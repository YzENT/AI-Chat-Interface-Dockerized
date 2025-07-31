import { useEffect, useState } from 'react';
import '../../../../css/sidebar/admin/UploadFilePage.css';
import {toast} from "react-toastify";
import { Trash2 } from 'lucide-react';

export default function UploadFilePage() {
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    const [file, setFile] = useState(null);
    const [allowedFileTypes, setAllowedFileTypes] = useState(null);
    const [uploadURL, setUploadURL] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [documentType, setDocumentType] = useState('faq'); // Defaults to FAQ

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
    }, []);

    // Set restrictions, listening to documentType
    useEffect(() => {
        setDocumentRestrictions();
    }, [documentType]);

    const setDocumentRestrictions = async () => {
        try {
            const response = await fetch('/api/docs/config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to verify admin status');
            }

            const config = await response.json();
            if (config && documentType) {
                setAllowedFileTypes(config.allowed_types[documentType].map(type => '.' + type).join(','));
                setUploadURL('/docs/' + documentType);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const removeFileSelection = () => {
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload!");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api' + uploadURL, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
            
            toast.success(responseData.msg);

        } catch (error) {
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-header">
                <h1 className="upload-title">Upload File</h1>
                <div className="docs-type-selector">
                <button 
                    className={`type-button ${documentType === 'faq' ? 'active' : ''}`}
                    onClick={() => setDocumentType('faq')}
                    disabled={isLoading}
                >
                    FAQ
                </button>
                <button 
                    className={`type-button ${documentType === 'internal' ? 'active' : ''}`}
                    onClick={() => setDocumentType('internal')}
                    disabled={isLoading}
                >
                    Internal
                </button>
                </div>
            </div>
            <div className="upload-body">
                <form className="upload-form" onSubmit={handleSubmit}>
                    <label className="upload-label">Upload File ({documentType?.toUpperCase()})</label>
                    <div className="upload-file-wrapper">

                        <input
                            type="file"
                            id="file"
                            name="file"
                            className="upload-input-hidden"
                            accept={allowedFileTypes}
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />

                        <label htmlFor="file" className="upload-input-button">
                            Choose File
                        </label>
                        <span className="upload-filename">
                            {file?.name || "No file chosen"}
                        </span>

                        <button 
                            type="button"
                            onClick={() => removeFileSelection()}
                            className="upload-remove-selection-button"
                            disabled={isLoading || !file}
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        className={`upload-submit-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner"></div>
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
