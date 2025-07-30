import { useState } from 'react';
import { X, User, LogOut } from 'lucide-react';
import {toast} from "react-toastify";
import '../../../../css/sidebar/user/Modal_Profile.css';

export default function Modal_Profile({ closeProfileModal }) {

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            localStorage.removeItem(import.meta.env.VITE_BEARER_NAME);
            toast.success(responseData.msg);

            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            toast.error(error.message || 'Failed to logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={closeProfileModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Profile Tools</h2>
                    <button 
                        type="button"
                        onClick={closeProfileModal}
                        className="modal-close"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <button 
                        className="edit-profile-button" 
                        onClick={() => window.location.href = '/profile'}
                    >
                        <User size={16} />
                        Edit Profile
                    </button>
                    <button 
                        className="logout-button" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <>
                                <div className="spinner"></div>
                                Logging out...
                            </>
                        ) : (
                            <>
                                <LogOut size={16} />
                                Logout
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

}