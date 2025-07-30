import { useEffect, useState } from 'react';
import { AlignJustify, Home, User, MessageCircle, FolderSearch, FileUp, Bot, Bug} from 'lucide-react';
import {toast} from "react-toastify";
import '../../../css/sidebar/Sidebar.css';
import Modal_Profile from './user/Modal_Profile';

export default function Sidebar() {

    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const response = await fetch('/api/verify-admin', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to verify admin status');
            }

            // Boolean value
            const isUserAdmin = await response.json();

            if (isUserAdmin) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }

        } catch (error) {
            toast.error(error.message);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <button className="sidebar-button primary">
                    <AlignJustify size={20} />
                </button>
            </div>

            <div className="sidebar-section">
                <a href="/" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                    <Home size={20} />
                </a>
                <span className="sidebar-label">Home</span>
            
                <button className="sidebar-button primary" onClick={() => setShowProfileModal(true)}>
                    <User size={20}/>
                </button>
                <span className="sidebar-label">Profile</span>

                {showProfileModal && <Modal_Profile closeProfileModal={() => setShowProfileModal(false)} />}
            </div>

            {/* Admin Tools */}
            {isAdmin && !isLoading && (
                <div className="sidebar-section">
                    <div className="sidebar-separator">
                        <span className="sidebar-section-title">Admin Tools</span>
                    </div>
                    
                    <a href="/wati" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <MessageCircle size={20} />
                    </a>
                    <span className="sidebar-label">WATI</span>

                    <a href="/docs/upload" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <FileUp size={20} />
                    </a>
                    <span className="sidebar-label">Upload</span>

                    <a href="/docs/get" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <FolderSearch size={20} />
                    </a>
                    <span className="sidebar-label">View Files</span>

                    <a href="/chatbot/train" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <Bot size={20} />
                    </a>
                    <span className="sidebar-label">Prompt Training</span>

                    <a href="/chatbot/knowledge" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <Bot size={20} />
                    </a>
                    <span className="sidebar-label">Knowledge</span>

                    <a href="/chatbot/crawl" className="sidebar-button primary" target="_self" rel="noopener noreferrer">
                        <Bug size={20} />
                    </a>
                    <span className="sidebar-label">Web Crawl</span>

                </div>
            )}

        </div>
    );
}
