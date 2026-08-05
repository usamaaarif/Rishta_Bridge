import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Plus, Edit, KeyRound, ShieldCheck, X, FileBadge, Upload } from 'lucide-react';
import { Input } from '../components/ui';

export default function Dashboard() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [profileLimit, setProfileLimit] = useState(3);
    const [userRole, setUserRole] = useState('self');
    const [loading, setLoading] = useState(true);
    const [passwordModal, setPasswordModal] = useState({ isOpen: false, oldPassword: '', newPassword: '' });
    const [cnicFile, setCnicFile] = useState(null);
    const [cnicUploading, setCnicUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProfiles = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [meRes, profilesRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/profiles/me')
                ]);
                setProfileLimit(meRes.data.profile_limit);
                setUserRole(meRes.data.role);
                setProfiles(Array.isArray(profilesRes.data) ? profilesRes.data : (profilesRes.data ? [profilesRes.data] : []));
            } catch (error) {
                console.error("Failed to fetch profiles", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, [navigate]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/change-password', {
                old_password: passwordModal.oldPassword,
                new_password: passwordModal.newPassword
            });
            alert('Password changed successfully!');
            setPasswordModal({ isOpen: false, oldPassword: '', newPassword: '' });
        } catch (error) {
            console.error("Change password error", error);
            alert("Failed to change password: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    const handleCnicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCnicFile(file);
        setCnicUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/upload/cnic', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('CNIC uploaded successfully! Pending verification.');
            setCnicFile(null);
        } catch (error) {
            console.error('Failed to upload CNIC', error);
            alert('Failed to upload CNIC.');
        } finally {
            setCnicUploading(false);
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (!window.confirm("Are you sure you want to delete this profile? This cannot be undone.")) return;
        
        try {
            await api.delete(`/profiles/${profileId}`);
            setProfiles(profiles.filter(p => p.id !== profileId));
            alert("Profile deleted successfully.");
        } catch (error) {
            console.error("Failed to delete profile", error);
            alert("Failed to delete profile.");
        }
    };

    const filteredProfiles = profiles.filter(p => 
        (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.id?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Profiles</h1>
                        <p className="text-slate-600">Manage all profiles created by you.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No Profiles Yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create a profile for yourself or a family member to start finding matches.</p>
                        <Link to="/onboarding">
                            <Button>Create Your First Profile</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                            <div className="w-full md:w-96">
                                <Input
                                    placeholder="Search by ID or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Create New Card */}
                            {(userRole === 'admin' || profiles.length < profileLimit) ? (
                                <Link to="/onboarding" className="group relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-white">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium text-slate-900">Create New Profile</span>
                                </Link>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50 text-center">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-rose-900">Profile Limit Reached</span>
                                    <span className="text-sm text-rose-700">You have reached your limit of {profileLimit} profiles. Please contact the Admin to increase this limit.</span>
                                </div>
                            )}

                            {/* Profile Cards */}
                            {filteredProfiles.map(profile => (
                                <div key={profile.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                                            {profile.image_url ? (
                                                <img src={profile.image_url.startsWith('http') ? profile.image_url : `http://localhost:8000${profile.image_url}`} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-6 h-6" /></div>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {profile.id}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{profile.gender}, {profile.marital_status}</p>

                                    <div className="flex gap-2">
                                        <Link to={`/onboarding?edit=${profile.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full text-sm h-9">
                                                <Edit className="w-3 h-3 mr-2" /> Edit
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="outline" 
                                            className="text-sm h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                            onClick={() => handleDeleteProfile(profile.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Identity Verification Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FileBadge className="w-6 h-6 text-primary" />
                        Identity Verification
                    </h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900">CNIC Verification</h3>
                            <p className="text-sm text-slate-500">Upload a clear photo of your CNIC to get a verified badge.</p>
                        </div>
                        <div>
                            <input 
                                type="file" 
                                id="cnic-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleCnicUpload}
                                disabled={cnicUploading}
                            />
                            <label htmlFor="cnic-upload">
                                <Button as="span" variant="outline" className="cursor-pointer" disabled={cnicUploading}>
                                    <Upload className="w-4 h-4 mr-2" /> 
                                    {cnicUploading ? 'Uploading...' : 'Upload CNIC'}
                                </Button>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Security Settings Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        Security Settings
                    </h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900">Account Password</h3>
                            <p className="text-sm text-slate-500">Change your password to keep your account secure.</p>
                        </div>
                        <Button variant="outline" onClick={() => setPasswordModal({ isOpen: true, oldPassword: '', newPassword: '' })}>
                            <KeyRound className="w-4 h-4 mr-2" /> Change Password
                        </Button>
                    </div>
                </div>

            </div>

            {/* Change Password Modal */}
            {passwordModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Change Password</h3>
                            <button onClick={() => setPasswordModal({ isOpen: false, oldPassword: '', newPassword: '' })} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                required
                                value={passwordModal.oldPassword}
                                onChange={(e) => setPasswordModal({...passwordModal, oldPassword: e.target.value})}
                            />
                            <Input
                                label="New Password"
                                type="password"
                                required
                                value={passwordModal.newPassword}
                                onChange={(e) => setPasswordModal({...passwordModal, newPassword: e.target.value})}
                            />
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setPasswordModal({ isOpen: false, oldPassword: '', newPassword: '' })}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
