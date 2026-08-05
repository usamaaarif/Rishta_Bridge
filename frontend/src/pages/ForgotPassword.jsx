import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import api from '../lib/api';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request, 2: Reset
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/request-reset-otp', { phone_number: formData.phone });
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Error: " + (error.response?.data?.detail || "Failed to send OTP"));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await api.post('/reset-password', {
                phone_number: formData.phone,
                otp: formData.otp,
                new_password: formData.newPassword
            });
            alert("Password Reset Successful! Please login.");
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert("Error: " + (error.response?.data?.detail || "Failed to reset password"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    {step === 1 ? 'Reset Password' : 'Set New Password'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {step === 1
                        ? "Enter your phone number to receive a verification code."
                        : "Enter the code sent to your phone and choose a new password."}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-lg sm:px-10 border border-slate-100">
                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleRequestOTP}>
                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                placeholder="03001234567"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
                                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                                OTP sent to <b>{formData.phone}</b>. (Mock: Use '1234')
                            </div>
                            <Input
                                label="OTP Code"
                                name="otp"
                                type="text"
                                placeholder="1234"
                                required
                                value={formData.otp}
                                onChange={handleChange}
                            />
                            <Input
                                label="New Password"
                                name="newPassword"
                                type="password"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
                                {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 hover:text-slate-900"
                            onClick={() => navigate('/login')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
