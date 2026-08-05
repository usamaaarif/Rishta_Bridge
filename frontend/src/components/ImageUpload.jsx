import React, { useState } from 'react';
import { Button } from './ui';
import api from '../lib/api';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onUpload, initialImage }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(initialImage);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreview(res.data.url); // Use the relative URL returned by backend
            onUpload(res.data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            {preview ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {/* Prepend base URL if it's a relative path */}
                    <img
                        src={(preview || '').startsWith('http') ? preview : `http://localhost:8000${preview}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-12 h-12" />
                </div>
            )}

            <div className="text-center">
                <label className="cursor-pointer">
                    <span className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 h-9 px-3 shadow-sm">
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        {uploading ? 'Uploading...' : 'Choose Photo'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
                <p className="text-xs text-slate-500 mt-2">Max 5MB (JPG, PNG)</p>
            </div>
        </div>
    );
}
