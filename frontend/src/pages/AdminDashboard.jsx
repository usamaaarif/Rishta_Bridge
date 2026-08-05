import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Input } from '../components/ui';
import { ShieldAlert, Check, X, Image as ImageIcon, Users, KeyRound, Search, FileText } from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'users'
    
    // Verification state
    const [photos, setPhotos] = useState([]);
    const [cnics, setCnics] = useState([]);
    
    // Users state
    const [users, setUsers] = useState([]);
    
    // Profiles state
    const [allProfiles, setAllProfiles] = useState([]);
    const [searchProfileId, setSearchProfileId] = useState('');
    
    // Modals
    const [resetModal, setResetModal] = useState({ isOpen: false, userId: null, newPassword: '' });
    const [rejectModal, setRejectModal] = useState({ isOpen: false, targetType: '', targetId: '', reason: 'Blurry Image', notes: '' });
    const [limitModal, setLimitModal] = useState({ isOpen: false, userId: null, currentLimit: 3, newLimit: 3 });
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [navigate, role, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'verification') {
                const resPhotos = await api.get('/moderation/photos/pending');
                setPhotos(resPhotos.data);
                const resCnics = await api.get('/moderation/cnic/pending');
                setCnics(resCnics.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } else if (activeTab === 'profiles') {
                const endpoint = searchProfileId ? `/admin/profiles?profile_id=${searchProfileId}` : '/admin/profiles';
                const res = await api.get(endpoint);
                setAllProfiles(res.data);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (targetType, targetId, action, reason = null, notes = null) => {
        if (action === 'reject' && !rejectModal.isOpen) {
            setRejectModal({ isOpen: true, targetType, targetId, reason: 'Blurry Image', notes: '' });
            return;
        }

        try {
            const endpoint = targetType === 'photo' 
                ? `/moderation/photos/${targetId}/decision` 
                : `/moderation/cnic/${targetId}/decision`;

            await api.post(endpoint, { action, reason, notes });
            
            if (targetType === 'photo') {
                setPhotos(photos.filter(p => p.id !== targetId));
            } else {
                setCnics(cnics.filter(c => c.id !== targetId));
            }
            
            if (rejectModal.isOpen) {
                setRejectModal({ isOpen: false, targetType: '', targetId: '', reason: 'Blurry Image', notes: '' });
            }
        } catch (error) {
            console.error(`Failed to ${action} ${targetType}`, error);
            alert(`Failed to ${action}. Check console.`);
        }
    };

    const handleSearchProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = searchProfileId ? `/admin/profiles?profile_id=${searchProfileId}` : '/admin/profiles';
            const res = await api.get(endpoint);
            setAllProfiles(res.data);
        } catch (error) {
            console.error('Failed to search profiles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (!window.confirm("Are you sure you want to delete this profile? This cannot be undone.")) return;
        
        try {
            await api.delete(`/profiles/${profileId}`);
            setAllProfiles(allProfiles.filter(p => p.id !== profileId));
            alert("Profile deleted successfully.");
        } catch (error) {
            console.error("Failed to delete profile", error);
            alert("Failed to delete profile.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/users/${resetModal.userId}/reset-password`, {
                new_password: resetModal.newPassword
            });
            alert('Password reset successfully!');
            setResetModal({ isOpen: false, userId: null, newPassword: '' });
        } catch (error) {
            console.error('Failed to reset password', error);
            alert('Failed to reset password.');
        }
    };

    const handleUpdateLimit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${limitModal.userId}/limit`, {
                new_limit: parseInt(limitModal.newLimit)
            });
            alert('Profile limit updated successfully!');
            setUsers(users.map(u => u.id === limitModal.userId ? { ...u, profile_limit: parseInt(limitModal.newLimit) } : u));
            setLimitModal({ isOpen: false, userId: null, currentLimit: 3, newLimit: 3 });
        } catch (error) {
            console.error('Failed to update limit', error);
            alert('Failed to update limit.');
        }
    };

    const filteredUsers = users.filter(u => 
        u.id.includes(userSearchTerm) || 
        (u.phone_number && u.phone_number.includes(userSearchTerm)) ||
        (u.email && u.email.includes(userSearchTerm))
    );

    if (loading && photos.length === 0 && users.length === 0) {
        return <div className="min-h-screen bg-slate-50 flex justify-center items-center">Loading Admin Panel...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
                        <p className="text-slate-600">Moderate content and manage platform safety.</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('verification')}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'verification' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <ImageIcon className="w-4 h-4" /> Verification Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Users className="w-4 h-4" /> User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('profiles')}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'profiles' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <FileText className="w-4 h-4" /> All Profiles
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {activeTab === 'verification' && (
                        <>
                            {/* CNIC Queue */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-primary" />
                                    Pending CNIC Verifications
                                </h2>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                                    {cnics.length} Pending
                                </span>
                            </div>
                            
                            {cnics.length === 0 ? (
                                <div className="p-8 text-center border-b border-slate-100">
                                    <p className="text-slate-500 font-medium">No CNICs pending moderation.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 border-b border-slate-100">
                                    {cnics.map(cnic => (
                                        <div key={cnic.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50">
                                            <div className="aspect-video bg-slate-200 relative">
                                                <img 
                                                    src={cnic.metadata_json?.startsWith('http') ? cnic.metadata_json : `http://localhost:8000${cnic.metadata_json}`} 
                                                    alt="Pending CNIC" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="text-xs text-slate-500 font-mono mb-3 truncate">
                                                    User ID: {cnic.user_id}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                                        onClick={() => handleDecision('cnic', cnic.id, 'reject')}
                                                    >
                                                        <X className="w-4 h-4 mr-1" /> Reject
                                                    </Button>
                                                    <Button 
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => handleDecision('cnic', cnic.id, 'approve')}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Photo Queue */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    Pending Profile Photos
                                </h2>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                                    {photos.length} Pending
                                </span>
                            </div>
                            
                            {photos.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 font-medium">No photos pending moderation.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {photos.map(photo => (
                                        <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50">
                                            <div className="aspect-square bg-slate-200 relative">
                                                <img 
                                                    src={photo.file_path.startsWith('http') ? photo.file_path : `http://localhost:8000${photo.file_path}`} 
                                                    alt="Pending Photo" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="text-xs text-slate-500 font-mono mb-3 truncate">
                                                    Profile ID: {photo.profile_id}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                                        onClick={() => handleDecision('photo', photo.id, 'reject')}
                                                    >
                                                        <X className="w-4 h-4 mr-1" /> Reject
                                                    </Button>
                                                    <Button 
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => handleDecision('photo', photo.id, 'approve')}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Platform Users
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="text" 
                                        placeholder="Search by ID or Phone..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                            <th className="p-4 font-semibold">User ID</th>
                                            <th className="p-4 font-semibold">Contact</th>
                                            <th className="p-4 font-semibold">Auth Method</th>
                                            <th className="p-4 font-semibold">Role</th>
                                            <th className="p-4 font-semibold text-center">Limit</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-mono text-xs text-slate-500">{user.id}</td>
                                                <td className="p-4 text-sm font-medium text-slate-900">
                                                    {user.email || user.phone_number || 'N/A'}
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 capitalize">{user.auth_provider}</td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-center font-bold text-slate-700">
                                                    {user.profile_limit}
                                                </td>
                                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        className="text-xs h-8"
                                                        onClick={() => setLimitModal({ isOpen: true, userId: user.id, currentLimit: user.profile_limit || 3, newLimit: user.profile_limit || 3 })}
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" /> Edit Limit
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        className="text-xs h-8"
                                                        onClick={() => setResetModal({ isOpen: true, userId: user.id, newPassword: '' })}
                                                    >
                                                        <KeyRound className="w-3 h-3 mr-1" /> Reset Pwd
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'profiles' && (
                        <>
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center bg-slate-50 gap-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    All User Profiles
                                </h2>
                                <form onSubmit={handleSearchProfile} className="flex gap-2 w-full md:w-auto">
                                    <Input 
                                        type="text" 
                                        placeholder="Search by Profile ID..." 
                                        value={searchProfileId} 
                                        onChange={(e) => setSearchProfileId(e.target.value)}
                                        className="h-10 min-w-[250px] mb-0"
                                    />
                                    <Button type="submit" className="h-10 whitespace-nowrap">Search</Button>
                                </form>
                            </div>
                            
                            {allProfiles.length === 0 ? (
                                <div className="p-8 text-center border-b border-slate-100">
                                    <p className="text-slate-500 font-medium">No profiles found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                                    {allProfiles.map(profile => (
                                        <div key={profile.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50 flex flex-col">
                                            <div className="aspect-square bg-slate-200 relative">
                                                {profile.image_url ? (
                                                    <img 
                                                        src={profile.image_url.startsWith('http') ? profile.image_url : `http://localhost:8000${profile.image_url}`} 
                                                        alt="Profile" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <FileText className="w-12 h-12 opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-white flex-1 flex flex-col">
                                                <h3 className="font-bold text-slate-900 truncate" title={profile.name}>{profile.name || 'Unnamed Profile'}</h3>
                                                <div className="mt-2 mb-2 bg-slate-100 border border-slate-200 p-2 rounded-md">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Profile ID</span>
                                                    <span className="text-xs font-mono text-slate-800 break-all">{profile.id}</span>
                                                </div>
                                                <div className="text-sm text-slate-500 space-y-1 flex-1">
                                                    <p>{profile.gender || 'Not specified'}</p>
                                                    <p>{profile.marital_status || 'Not specified'}</p>
                                                    <p className="truncate">{profile.profession || 'Not specified'}</p>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full mt-4 text-sm h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                                    onClick={() => handleDeleteProfile(profile.id)}
                                                >
                                                    <X className="w-4 h-4 mr-2" /> Delete Profile
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Reset User Password</h3>
                            <button onClick={() => setResetModal({ isOpen: false, userId: null, newPassword: '' })} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 mb-4">
                                You are forcing a password reset for user ID: <span className="font-mono text-xs bg-slate-100 px-1 rounded">{resetModal.userId}</span>
                            </p>
                            <Input
                                label="New Password"
                                type="password"
                                required
                                value={resetModal.newPassword}
                                onChange={(e) => setResetModal({...resetModal, newPassword: e.target.value})}
                                placeholder="Enter strong password"
                            />
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setResetModal({ isOpen: false, userId: null, newPassword: '' })}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 border-red-600">
                                    Force Reset
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Reject Request</h3>
                            <button onClick={() => setRejectModal({ ...rejectModal, isOpen: false })} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border p-2"
                                    value={rejectModal.reason}
                                    onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})}
                                >
                                    <option value="Blurry Image">Blurry Image</option>
                                    <option value="Mismatch with Details">Mismatch with Details</option>
                                    <option value="Fake / Stock Photo">Fake / Stock Photo</option>
                                    <option value="Inappropriate Content">Inappropriate Content</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <Input
                                label="Additional Notes (Optional)"
                                value={rejectModal.notes}
                                onChange={(e) => setRejectModal({...rejectModal, notes: e.target.value})}
                                placeholder="Explain what the user needs to fix..."
                            />
                            <div className="flex gap-3 mt-6">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}>
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
                                    onClick={() => handleDecision(rejectModal.targetType, rejectModal.targetId, 'reject', rejectModal.reason, rejectModal.notes)}
                                >
                                    Confirm Rejection
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {limitModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleUpdateLimit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Edit Profile Limit</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Update the maximum number of profiles this user can create. Current limit: {limitModal.currentLimit}.
                        </p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Limit</label>
                                <Input 
                                    type="number"
                                    min="1"
                                    required
                                    value={limitModal.newLimit}
                                    onChange={(e) => setLimitModal({ ...limitModal, newLimit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setLimitModal({ isOpen: false, userId: null, currentLimit: 3, newLimit: 3 })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Limit
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
