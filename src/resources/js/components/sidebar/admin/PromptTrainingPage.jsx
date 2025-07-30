import { useState, useRef, useEffect } from 'react';
import '../../../../css/sidebar/admin/PromptTrainingPage.css';
import {toast} from "react-toastify";
import { Heater } from 'lucide-react';

export default function PromptTrainingPage() {
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    const [prompt, setPrompt] = useState('');
    const [previousPromptsLoading, setPreviousPromptsLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [previousAddedPrompts, setPreviousAddedPrompts] = useState([]);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        getPreviousAddedPrompts();
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const getPreviousAddedPrompts = async () => {
        try {
            setPreviousPromptsLoading(true);
            const response = await fetch('/api/chatbot/prompt/get', {
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

            setPreviousAddedPrompts(responseData.data.added_prompts);
        } catch (error) {
            toast.error(error.message);
            setPreviousAddedPrompts([]);
        } finally {
            setPreviousPromptsLoading(false);
        }

    };

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        try {
            setSubmitLoading(true);
            const response = await fetch ('/api/chatbot/prompt/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    prompt: prompt,
                }),
            });

            if (!response.ok) {
                throw new Error(response.msg);
            }

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
            toast.error(error.message || 'Unable to upload prompt onto server.');
        } finally {
            setSubmitLoading(false);
            getPreviousAddedPrompts(); // Refresh prompts
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div className="prompt-training-page">
            {/* Header */}
            <div className="prompt-page-header">
                <h1 className="prompt-page-title">Prompt Training</h1>
            </div>

            <div className="prompt-training-main-page">
                {/* Input Section */}
                <div className="prompt-input-section">
                    <h2 className="prompt-section-title">Add New Knowledge</h2>
                    
                    <div className="prompt-input-container">
                        <div className="prompt-input-field-container">
                            <label htmlFor="prompt" className="prompt-input-label">
                                Knowledge Prompt
                            </label>
                            <div className="prompt-input-wrapper">
                                <div className="prompt-input-area-wrapper">
                                    <textarea
                                    id="prompt"
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your knowledge prompt here..."
                                    className="prompt-textarea"
                                    />
                                </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitLoading || !prompt.trim()}
                                className="prompt-submit-button"
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
                    
                        <div className="prompt-input-tip">
                            Tip: Use Ctrl+Enter to quickly submit your prompt
                        </div>
                    </div>
                </div>

                <div className="prompt-knowledge-section">
                    <h2 className="prompt-section-title">Previous Knowledge Entries</h2>
                    <div className="prompt-knowledge-wrapper">

                        {previousPromptsLoading ? (
                            <div className="prompt-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading added prompts...</p>
                            </div>
                        ) : previousAddedPrompts.length === 0 ? (
                        <div className="prompt-empty">
                            <Heater size={48} className="text-gray-500" />
                            <p>No prompts found.</p>
                        </div>
                        ) : (
                            <>
                            {previousAddedPrompts.map((entry) => (
                                <div key={entry.prompt_id} className="prompt-knowledge-card">
                                    <div className="prompt-knowledge-card-row">
                                        <div className="prompt-card-id">Prompt ID: {entry.prompt_id}</div>
                                        <div className="prompt-card-content">
                                            <p className="prompt-card-prompt">{entry.prompt}</p>
                                        </div>
                                        <div className="prompt-card-date">
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
