import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { ShieldCheck, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useGoogleLogin } from '@react-oauth/google';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        profileCreator: 'Parent',
        phoneNumber: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const res = await api.post('/auth/google', { 
                    access_token: tokenResponse.access_token 
                });
                localStorage.setItem('token', res.data.access_token);
                navigate(from, { replace: true });
            } catch (error) {
                console.error("Google Login Error:", error);
                alert("Google Login Failed: " + (error.response?.data?.detail || "Invalid token"));
            } finally {
                setIsLoading(false);
            }
        },
        onError: error => console.error('Google Login Failed', error)
    });

    const handleSendOTP = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/phone/request-otp', { phone_number: formData.phoneNumber });
            setStep(3); // Move to OTP verify
        } catch (error) {
            console.error("Failed to send OTP", error);
            alert("Failed to send OTP: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/phone/verify-otp', { phone_number: formData.phoneNumber, otp: formData.otp });
            setStep(4); // Move to Password setup
        } catch (error) {
            console.error("Failed to verify OTP", error);
            alert("Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                phone_number: formData.phoneNumber,
                password: formData.password,
                role: formData.profileCreator.toLowerCase()
            });
            alert("Account created! Please login.");
            navigate('/login', { state: { from } }); // Pass the original return path to login
        } catch (error) {
            console.error("Registration failed", error);
            alert("Registration Failed: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {step === 1 && <User className="h-6 w-6 text-primary" />}
                        {step === 2 && <Phone className="h-6 w-6 text-primary" />}
                        {step === 3 && <ShieldCheck className="h-6 w-6 text-primary" />}
                        {step === 4 && <CheckCircle className="h-6 w-6 text-primary" />}
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">
                        {step === 1 && "Start Account Creation"}
                        {step === 2 && "Mobile Verification"}
                        {step === 3 && "Verify OTP"}
                        {step === 4 && "Secure your Account"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {step === 1 && "This helps us tailor the experience for you."}
                        {step === 2 && "We need to verify you are a real person."}
                        {step === 3 && "Enter the code sent to " + formData.phoneNumber}
                        {step === 4 && "Set a strong password for login."}
                    </p>
                </div>

                {/* Step 1: Profile Creator */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            {['Self', 'Parent', 'Sibling', 'Relative', 'Rishta Consultant'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, profileCreator: type })}
                                    className={`flex items-center p-4 border rounded-xl transition-all ${formData.profileCreator === type
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center mr-4 ${formData.profileCreator === type ? 'border-primary' : 'border-slate-300'
                                        }`}>
                                        {formData.profileCreator === type && <div className="h-2 w-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-medium text-slate-900">{type}</span>
                                </button>
                            ))}
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        
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
                                    disabled={isLoading}
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                                    Google
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Phone Number */}
                {step === 2 && (
                    <div className="space-y-6">
                        <Input
                            label="Mobile Number"
                            name="phoneNumber"
                            type="tel"
                            placeholder="+92 300 1234567"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md">
                            <p>🔒 Your number is <strong>never shared</strong> publicy.</p>
                            <p>⚠️ We will send a One-Time Password via SMS/WhatsApp.</p>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleSendOTP} isLoading={isLoading}>
                            Send Verification Code
                        </Button>
                        <button onClick={() => setStep(1)} className="w-full text-sm text-slate-500 hover:text-primary">Go Back</button>
                    </div>
                )}

                {/* Step 3: Verify OTP */}
                {step === 3 && (
                    <div className="space-y-6">
                        <Input
                            label="Enter 6-digit Code"
                            name="otp"
                            type="text"
                            placeholder="123456"
                            className="text-center text-2xl tracking-widest"
                            value={formData.otp}
                            onChange={handleChange}
                        />
                        <div className="text-center text-sm">
                            <span className="text-slate-500">Didn't receive it? </span>
                            <button className="text-primary font-medium hover:underline">Resend</button>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleVerifyOTP} isLoading={isLoading}>
                            Verify & Continue
                        </Button>
                        <button onClick={() => setStep(2)} className="w-full text-sm text-slate-500 hover:text-primary">Change Number</button>
                    </div>
                )}

                {/* Step 4: Password */}
                {step === 4 && (
                    <div className="space-y-6">
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <Button className="w-full" size="lg" onClick={handleRegister} isLoading={isLoading}>
                            Create Account
                        </Button>
                    </div>
                )}

                {/* Footer Link */}
                <p className="text-center text-sm text-slate-600 mt-4">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="font-medium text-primary hover:text-emerald-800 underline transition-colors"
                    >
                        Log in
                    </button>
                </p>

            </div>
        </div>
    );
}
