import React, { useState } from 'react';
import { Button } from './ui';
import { X, Loader2, Send } from 'lucide-react';
import api from '../lib/api';

export default function ConnectModal({ isOpen, onClose, profileId, profileName }) {
    const [message, setMessage] = useState("I'm interested in your profile. Please accept my request to connect.");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        setLoading(true);
        try {
            await api.post('/connect/', {
                receiver_profile_id: profileId,
                message: message
            });
            alert("Connection Request Sent Successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Failed to send request";
            if (msg === "Not authenticated") {
                // Should be handled by parent, but just in case
                alert("Please login to connect.");
            } else {
                alert(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Connect with {profileName}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-600">
                        Send a message to introduce yourself. Profiles with personalized messages are 3x more likely to get a response.
                    </p>
                    <textarea
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                        placeholder="Write your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSend} disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Request
                    </Button>
                </div>
            </div>
        </div>
    );
}
