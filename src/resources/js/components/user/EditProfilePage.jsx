import { useState, useEffect } from 'react';
import { User, Mail } from 'lucide-react';
import '../../../css/user/EditProfilePage.css';
import { toast } from 'react-toastify';

export default function EditProfilePage() {

    const [submitLoading, setSubmitLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const bearerToken = localStorage.getItem(import.meta.env.VITE_BEARER_NAME);

    const [initialProfile, setInitialProfile] = useState({
        name: '',
        email: '',
    });

    const [currentProfile, setCurrentProfile] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        if (!bearerToken) {
            window.location.href = '/login';
            return;
        }
        getUserDetails();
    }, []);

    // Check if any changes
    useEffect(() => {
        const changed = (currentProfile.name !== initialProfile.name) || (currentProfile.email !== initialProfile.email);
        setHasChanges(changed);
    }, [currentProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getUserDetails = async () => {
        try {
            const response = await fetch('/api/profile/get-details', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to verify user');
            }

            const responseData = await response.json();

            if (!responseData['success']) {
                throw new Error(responseData.msg);
            }

            setInitialProfile({
                name: responseData['data']['name'],
                email: responseData['data']['email'],
            });

            setCurrentProfile({
                name: responseData['data']['name'],
                email: responseData['data']['email'],
            });
        } catch (error) {
            toast.error(error.message || 'Something went wrong trying to fetch user details.');
        }
    };

    const handleSave = async () => {
        try {
            setSubmitLoading(true);
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + bearerToken,
                },
                body: JSON.stringify({
                    name: currentProfile.name,
                    email: currentProfile.email,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
            
            toast.success(responseData.msg);
            getUserDetails();
        } catch (error) {
            toast.error(error.message || 'Failed to update user profile.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-card">
                <div className="edit-profile-header">
                    <h1 className="edit-profile-title">Edit Profile</h1>
                    <p className="edit-profile-subtitle">Update your account information</p>
                </div>

                <div className="edit-profile-form">
                    <div className="edit-profile-form-group">
                        <label className="edit-profile-form-label">Full Name</label>
                            <div className="edit-profile-input-wrapper">
                            <User size={20} className="edit-profile-input-icon" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={currentProfile.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="edit-profile-form-input"
                            />
                            </div>
                    </div>

                    <div className="edit-profile-form-group">
                        <label className="edit-profile-form-label">Email Address</label>
                            <div className="edit-profile-input-wrapper">
                            <Mail size={20} className="edit-profile-input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={currentProfile.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                className="edit-profile-form-input"
                            />
                            </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges || submitLoading}
                        className="edit-profile-save-button"
                    >
                        {submitLoading && <div className="loading-spinner" />}
                        {submitLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="edit-profile-profile-footer">
                    <p className="edit-profile-footer-text">
                        Need help? 
                        <button
                            className='edit-profile-footer-link'
                            onClick={() => toast.success('Coming Soon!')}
                        >
                                Contact Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}