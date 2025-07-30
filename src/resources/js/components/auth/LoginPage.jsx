import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import '../../../css/auth/LoginPage.css';

export default function LoginPage() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!credentials.email || !credentials.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                }),
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.msg);
            }

            localStorage.setItem(import.meta.env.VITE_BEARER_NAME, responseData.data.token);
            toast.success(responseData.msg);
            
            // Redirect to chat app
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">AI Assistant</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={credentials.email}
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
                                value={credentials.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="footer-text">
                        Don't have an account? 
                        <a href="/register" className="footer-link">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
}