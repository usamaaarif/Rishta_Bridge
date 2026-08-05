import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import api from '../lib/api';
import { Loader2, LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";

    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [otpStep, setOtpStep] = useState(1); // 1: request, 2: verify
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
        otp: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Send access_token to the upgraded backend endpoint
                const res = await api.post('/auth/google', { 
                    access_token: tokenResponse.access_token 
                });

                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('role', res.data.role);
                navigate(from, { replace: true });
            } catch (error) {
                console.error("Google Login Error:", error);
                alert("Google Login Failed: " + (error.response?.data?.detail || "Invalid token"));
            } finally {
                setLoading(false);
            }
        },
        onError: error => console.error('Google Login Failed', error)
    });

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const identifier = formData.phone.trim();
            if (!identifier.includes('@')) {
                const phoneForValidation = identifier.replace(/\s/g, '');
                if (!/^\+?\d+$/.test(phoneForValidation)) {
                    alert("Please enter a valid Email or Phone Number.");
                    setLoading(false);
                    return;
                }
            }

            const params = new URLSearchParams();
            params.append('username', formData.phone.trim());
            params.append('password', formData.password.trim());

            const res = await api.post('/auth/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', res.data.role);
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + (error.response?.data?.detail || "Invalid credentials"));
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const phoneForValidation = formData.phone.trim().replace(/\s/g, '');
            if (!/^\+?\d+$/.test(phoneForValidation)) {
                alert("Please enter a valid Phone Number.");
                setLoading(false);
                return;
            }
            await api.post('/auth/phone/request-otp', { phone_number: formData.phone.trim() });
            setOtpStep(2);
        } catch (error) {
            console.error("OTP Request Error:", error);
            alert("Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/phone/verify-otp', { 
                phone_number: formData.phone.trim(),
                otp: formData.otp.trim()
            });

            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', res.data.role);
            navigate(from, { replace: true });
        } catch (error) {
            console.error("OTP Verify Error:", error);
            alert("Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <LogIn className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-primary hover:text-emerald-800 transition-colors">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-lg sm:px-10 border border-slate-100">
                    
                    {/* Method Toggle */}
                    <div className="flex mb-6 border-b border-slate-200">
                        <button 
                            className={`flex-1 pb-2 font-medium text-sm transition-colors ${loginMethod === 'password' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => { setLoginMethod('password'); setOtpStep(1); }}
                        >
                            Password
                        </button>
                        <button 
                            className={`flex-1 pb-2 font-medium text-sm transition-colors ${loginMethod === 'otp' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setLoginMethod('otp')}
                        >
                            OTP (Passwordless)
                        </button>
                    </div>

                    {loginMethod === 'password' ? (
                        <form className="space-y-6" onSubmit={handleSubmitPassword}>
                            <Input
                                label="Email or Phone Number"
                                name="phone"
                                type="text"
                                placeholder="you@email.com or +923000000000"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <div>
                                <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
                                    {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                    Sign in
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={otpStep === 1 ? handleRequestOTP : handleVerifyOTP}>
                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                placeholder="+92 300 1234567"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={otpStep === 2}
                            />

                            {otpStep === 2 && (
                                <Input
                                    label="6-digit OTP Code"
                                    name="otp"
                                    type="text"
                                    placeholder="123456"
                                    required
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            )}

                            <div>
                                <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
                                    {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                    {otpStep === 1 ? 'Send OTP' : 'Verify & Sign in'}
                                </Button>
                            </div>
                            
                            {otpStep === 2 && (
                                <div className="text-center">
                                    <button type="button" onClick={() => setOtpStep(1)} className="text-sm text-primary hover:underline">
                                        Change Phone Number
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button 
                                type="button"
                                variant="outline" 
                                className="w-full flex justify-center items-center py-2 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-sm"
                                onClick={() => handleGoogleLogin()}
                                disabled={loading}
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                                Google
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
