import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Sidebar from './components/sidebar/Sidebar';
import ChatApp from './components/ChatApp';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import UploadFilePage from './components/sidebar/admin/UploadFilePage';
import GetFilePage from './components/sidebar/admin/GetFilePage';
import PromptTrainingPage from './components/sidebar/admin/PromptTrainingPage';
import KnowledgeHistoryPage from './components/sidebar/admin/KnowledgeHistoryPage';
import WebCrawlingPage from './components/sidebar/admin/WebCrawlingPage';
import WatiConfigPage from './components/sidebar/admin/WatiConfigPage';
import EditProfilePage from './components/user/EditProfilePage';
import { ToastContainer } from 'react-toastify';
import '../css/app.css';

const toastContainer = <ToastContainer
                            position="bottom-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            closeOnClick
                            pauseOnHover
                            draggable
                            theme="light"
                        />

const apps = [
    { id: 'chatbot-home-layout', component: <ChatApp />, showSidebar: true },
    { id: 'upload-file-layout', component: <UploadFilePage />, showSidebar: true, adminOnly: true },
    { id: 'get-file-layout', component: <GetFilePage />, showSidebar: true, adminOnly: true },
    { id: 'prompt-training-layout', component: <PromptTrainingPage />, showSidebar: true, adminOnly: true },
    { id: 'ai-knowledge-layout', component: <KnowledgeHistoryPage />, showSidebar: true, adminOnly: true },
    { id: 'web-crawling-layout', component: <WebCrawlingPage />, showSidebar: true, adminOnly: true },
    { id: 'wati-config-layout', component: <WatiConfigPage />, showSidebar: true, adminOnly: true },
    { id: 'login-layout', component: <LoginPage />, showSidebar: false },
    { id: 'register-layout', component: <RegisterPage />, showSidebar: false },
    { id: 'edit-profile-layout', component: <EditProfilePage />, showSidebar: true },
];

const verifyAdminStatus = async () => {
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
    if (!bearerToken) return false;

    try {
        const response = await fetch('/api/verify-admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + bearerToken,
            },
        });

        if (!response.ok) return false;

        const isUserAdmin = await response.json();
        return isUserAdmin === true;
    } catch (error) {
        return false;
    }
};

(async () => {
    for (const { id, component, showSidebar, adminOnly } of apps) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (adminOnly) {
            const userIsAdmin = await verifyAdminStatus();
            if (!userIsAdmin) {
                window.location.href = '/';
                continue;
            }
        }

        ReactDOM.createRoot(element).render(
            <>
                {toastContainer} {/* Render Toast Container globally */}
                <div className="app-container">
                    {showSidebar && <Sidebar />}
                    <div className={`main-content ${showSidebar ? 'with-sidebar' : 'without-sidebar'}`}>
                        {component}
                    </div>
                </div>
            </>
        );
    }
})();