import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import '../../../css/auth/RegisterPage.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!agreeToTerms) {
            toast.error("Please agree to the Terms and Conditions");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }
            
            toast.success(responseData.msg);
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);

        } catch (error) {
            toast.error(error.message || 'Registration failed. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const openTermsModal = (e) => {
        e.preventDefault();
        setShowTermsModal(true);
    };

    const closeTermsModal = () => {
        setShowTermsModal(false);
    };

    const acceptTerms = () => {
        setAgreeToTerms(true);
        setShowTermsModal(false);
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1 className="register-title">Join AI</h1>
                    <p className="register-subtitle">Create your account to get started</p>
                </div>

                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                className="form-input"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="password-toggle"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                className="form-input"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="password-toggle"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom">
                                {agreeToTerms && <Check size={16} />}
                            </span>
                            <span className="checkbox-text">
                                I agree to the<button type="button" onClick={openTermsModal} className="terms-link" >Terms and Conditions</button>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="register-button"
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="register-footer">
                    <p className="footer-text">
                        Already have an account? 
                        <a href="/login" className="footer-link">Sign in</a>
                    </p>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            {showTermsModal && <TermsAndConditionsModal closeTermsModal={closeTermsModal} acceptTerms={acceptTerms}/>}
        </div>
    );
}