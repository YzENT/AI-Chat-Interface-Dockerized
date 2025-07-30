import React, { useEffect, useRef, useState } from 'react';
import '../../../../css/sidebar/admin/WebCrawlingPage.css';
import {toast} from "react-toastify";
import { FileText, Download, Calendar, HardDrive, FileSpreadsheet, Heater } from 'lucide-react';

export default function WebCrawlingPage() {

    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    const [url, setURL] = useState('');
    const [previousURLsLoading, setPreviousURLsLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [previousAddedURLs, setPreviousAddedURLs] = useState([]);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        getPreviousAddedURLs();
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [url]);

    const getPreviousAddedURLs = async () => {
        try {
            setPreviousURLsLoading(true);
            const response = await fetch('/api/chatbot/crawl/get', {
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

            setPreviousAddedURLs(responseData.data.added_crawl);
        } catch (error) {
            toast.error(error.message);
            setPreviousAddedURLs([]);
        } finally {
            setPreviousURLsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!url.trim()) return;

        try {
            setSubmitLoading(true);
            const response = await fetch ('/api/chatbot/crawl/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    url: url,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            toast.success(responseData.msg);

            setTimeout(() => {
                // Clear the input after submission
                setPrompt('');
            }, 2000);
            
        } catch (error) {
            toast.error(error.message || 'Unable to upload specified URL onto server.');
        } finally {
            setSubmitLoading(false);
            getPreviousAddedURLs(); // Refresh previous entries
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div className="crawl-training-page">
            {/* Header */}
            <div className="crawl-page-header">
                <h1 className="crawl-page-title">Web Crawl</h1>
            </div>

            <div className="crawl-main-page">
                {/* Input Section */}
                <div className="crawl-input-section">
                    <h2 className="crawl-section-title">Add New URL to Crawl</h2>
                    
                    <div className="crawl-input-container">
                        <div className="crawl-input-field-container">
                            <label htmlFor="url" className="crawl-input-label">
                            Crawl URL
                            </label>
                            <div className="crawl-input-wrapper">
                                <div className="crawl-input-area-wrapper">
                                    <textarea
                                    id="url"
                                    ref={textareaRef}
                                    value={url}
                                    onChange={(e) => setURL(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g: https://example.com/"
                                    className="crawl-textarea"
                                    />
                                </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading || !url.trim()}
                                className="crawl-submit-button"
                            >
                                {submitLoading ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    <span>Loading...</span>
                                </>
                                ) : (
                                'Submit'
                                )}
                            </button>
                            </div>
                        </div>
                    
                        <div className="crawl-input-tip">
                            Tip: Use Ctrl+Enter to quickly submit your prompt
                        </div>
                    </div>
                </div>

                <div className="crawl-entries-section">
                    <h2 className="crawl-section-title">Previous Crawled URL's</h2>
                    <div className="crawl-entries-wrapper">

                        {previousURLsLoading ? (
                            <div className="crawl-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading crawled URL's...</p>
                            </div>
                        ) : previousAddedURLs.length === 0 ? (
                        <div className="crawl-empty">
                            <Heater size={48} className="text-gray-500" />
                            <p>No crawled entries found.</p>
                        </div>
                        ) : (
                            <>
                            {previousAddedURLs.map((entry) => (
                                <div key={entry.crawl_id} className="crawl-entries-card">
                                    <div className="crawl-entries-card-row">
                                        <div className="crawl-card-id">Crawl ID: {entry.crawl_id}</div>
                                        <div className="crawl-card-content">
                                            <p className="crawl-card-prompt">{entry.url}</p>
                                        </div>
                                        <div className="crawl-card-date">
                                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} {new Date(entry.created_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}