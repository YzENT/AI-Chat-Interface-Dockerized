import { useEffect, useState, useRef } from 'react';
import '../../css/ChatApp.css';
import { Send, MessageSquarePlus } from 'lucide-react';
import {toast} from "react-toastify";

export default function ChatApp() {
    const INITIAL_MESSAGE = {
        id: 0,
        type: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help with your health questions today?",
        timestamp: new Date()
    };

    const [isThinking, setIsThinking] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null); // Add textarea ref for auto-resize functionality
    const [convoID, setConvoID] = useState(null);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        checkUserValidity();
    }, []);

    // Reset textarea height when message is sent
    useEffect(() => {
        if (currentMessage === '') {
            adjustTextareaHeight();
        }
    }, [currentMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const checkUserValidity = async () => {
        try {
            const response = await fetch('/api/verify-user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to verify user');
            }

            // Boolean
            const isUserValid = await response.json();

            if (!isUserValid) {
                throw new Error('Invalid user, token may have expired.');
            }

            fetchPreviousConversation();
        } catch (error) {
            localStorage.removeItem(import.meta.env.VITE_BEARER_NAME);
            window.location.href = '/login';
        }
    };

    const fetchPreviousConversation = async () => {
        try {
            const response = await fetch('/api/chatbot/convo', {
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

            // See if user has previous chat history or no
            if (responseData.data.convo_messages === null) {
                handleNewChat();
            } else {
                setConvoID(responseData.data.convo_messages[0].conversation_id); // Just use the first key
                setChatHistory(
                    responseData.data.convo_messages.map(msg => ({
                        id: msg.message_id,
                        type: msg.sender_type,
                        content: msg.message,
                        timestamp: new Date(msg.created_at)
                    }))
                );
            }

        } catch (error) {
            return error.message || 'Unable to retrieve previous conversation.';
        }
    };

    const handleNewChat = () => {
        setConvoID(null);
        setChatHistory([INITIAL_MESSAGE]);
        setIsThinking(false);
    };

    // Auto-resize textarea function
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate the new height
        const minHeight = 48; // matches min-height in CSS
        const maxHeight = 120; // matches max-height in CSS
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        
        // Set the new height
        textarea.style.height = newHeight + 'px';
    };

    // Handle textarea change with auto-resize
    const handleTextareaChange = (e) => {
        setCurrentMessage(e.target.value);
        adjustTextareaHeight();
    };

    const getAIResponse = async () => {
        try {
            const aiResponse = await fetch ('/api/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    prompt: currentMessage,
                }),
            });

            const responseData = await aiResponse.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
            return responseData.data.response;
        } catch(error) {
            return error.message || 'Unable to retrieve response from server.';
        }
    }

    const storeMessage = async (message, sender_type) => {
        try {
            const response = await fetch ('/api/chatbot/convo/' + convoID, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    message: message,
                    sender_type: sender_type,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
        } catch(error) {
            toast.error( error.message || 'Unable to store message into server.');
        }
    }

    const handleSendMessage = async () => {
        if (isThinking || !currentMessage.trim()) {
            return;
        }

        setChatHistory(prevMessages => [...prevMessages, {
            id: Date.now(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        }]);

        if (convoID) {
            storeMessage(currentMessage, 'user');
        } else {
            await createNewConvo();
            setIsThinking(true);
        }

        setCurrentMessage(''); // Reset chatbar status

        // setTimeout(async () => {
        //     const thinkingMessageId = Date.now() + 1;
            
        //     setChatHistory(prevMessages => [...prevMessages, {
        //         id: thinkingMessageId,
        //         type: 'assistant',
        //         content: '...',
        //         timestamp: new Date()
        //     }]);
            
        //     try {
        //         setIsThinking(true);
        //         const ai_Response = await getAIResponse();
        //         storeMessage(ai_Response, 'assistant');
                
        //         // Replace thinking message with response
        //         setChatHistory(prevMessages => {
        //             return prevMessages.map(msg => 
        //                 msg.id === thinkingMessageId 
        //                     ? {
        //                         ...msg,
        //                         content: ai_Response,
        //                         timestamp: new Date()
        //                     }
        //                     : msg
        //             );
        //         });
                
        //     } catch (error) {
        //         toast.error(error.message);
        //         setChatHistory(prevMessages => {
        //             return prevMessages.map(msg => 
        //                 msg.id === thinkingMessageId 
        //                     ? {
        //                         ...msg,
        //                         content: `Error: ${error.message}`,
        //                         timestamp: new Date()
        //                     }
        //                     : msg
        //             );
        //         });
        //     } finally {
        //         setIsThinking(false);
        //     }
        // }, 1000);
    };

    const createNewConvo = async () => {
        try {
            const response = await fetch ('/api/chatbot/convo/create', { // Automatically stores newly sent message
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({ 
                    message: currentMessage,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
            
            setConvoID(responseData.data.convo_id);
            toast.success(responseData.msg || 'Conversation created successfully!');
        } catch(error) {
            toast.error(error.message || 'Unable to retrieve response from server.');
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="lifecare-container">
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <h1 className="chat-title">AI Assistant</h1>
                </div>

                {/* Messages Area */}
                <div className="messages-container">
                    {chatHistory.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message-wrapper ${msg.type}`}
                        >
                            <div className={`message ${msg.type} ${msg.content === '...' ? 'thinking' : ''}`}>
                                {msg.content === '...' ? (
                                    <div className="thinking-indicator">
                                        <div className="typing-dots">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="message-content">{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <button
                            className="chat-action-button"
                            onClick={handleNewChat}
                            disabled={chatHistory.length <= 1}
                        >
                            <MessageSquarePlus size={20} />
                        </button>
                        <div className="chat-input-field-wrapper">
                            <textarea
                                ref={textareaRef}
                                value={currentMessage}
                                onChange={handleTextareaChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="chat-input-field"
                                rows="1"
                                style={{
                                    minHeight: '48px',
                                    maxHeight: '120px',
                                    height: '48px', // Set initial height
                                    overflow: 'auto',
                                    resize: 'none'
                                }}
                            />
                        </div>
                        <button
                            className="chat-action-button"
                            onClick={handleSendMessage}
                            disabled={!currentMessage.trim() || isThinking}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
