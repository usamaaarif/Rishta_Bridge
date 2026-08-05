import React, { useState, useEffect } from 'react';
import ConnectModal from '../components/ConnectModal';
import { Button, Input, Select } from '../components/ui';
import { Filter, MapPin, Briefcase, Heart, BookOpen, Ruler, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import * as C from '../lib/constants';
import * as LD from '../lib/locationData';

export default function Search() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        city: '',
        sect: '',
        caste: '',
        marital_status: '',
        min_age: '',
        max_age: '',
        min_height: '',
        education: '',
        country: '',
        gender: ''
    });

    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConnect = (profile) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // Clean up filters (remove empty strings)
            const payload = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            
            const res = await api.post(`/search/profiles`, payload);
            setProfiles(res.data);
        } catch (error) {
            console.error("Failed to fetch profiles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Helpers for options
    const opts = (arr) => [{ label: 'Any', value: '' }, ...(arr || []).map(v => ({ label: v, value: v }))];
    const optsObj = (arr) => [{ label: 'Any', value: '' }, ...(arr || []).map(v => ({ label: v.label, value: v.value }))];
    const ageOpts = [{ label: 'Any', value: '' }, ...Array.from({ length: 43 }, (_, i) => ({ label: `${18 + i}`, value: `${18 + i}` }))];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Top Filters Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                        <Filter className="w-5 h-5 text-primary" />
                        <h2>Refine Search</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? 'Simple Search' : 'Advanced Search'}
                        </button>
                        <button
                            className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                            onClick={() => setFilters({
                                city: '', sect: '', caste: '', marital_status: '', min_age: '', max_age: '', min_height: '', education: '', country: '', state: ''
                            }) || fetchProfiles()}
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Basic Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Select
                        label="Gender"
                        options={[{ label: 'Any', value: '' }, { label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                    />
                    <Select
                        label="Looking For"
                        options={optsObj(C.MARITAL_STATUSES)}
                        value={filters.marital_status}
                        onChange={(e) => handleFilterChange('marital_status', e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Select
                            label="Min Age"
                            options={ageOpts}
                            value={filters.min_age}
                            onChange={(e) => handleFilterChange('min_age', e.target.value)}
                        />
                        <Select
                            label="Max Age"
                            options={ageOpts}
                            value={filters.max_age}
                            onChange={(e) => handleFilterChange('max_age', e.target.value)}
                        />
                    </div>

                    <Select
                        label="Country"
                        options={opts(LD.COUNTRIES)}
                        value={filters.country}
                        onChange={(e) => {
                            const newCountry = e.target.value;
                            setFilters(prev => ({ ...prev, country: newCountry, state: '', city: '' }));
                        }}
                    />

                    <Select
                        label="State"
                        options={filters.country && LD.LOCATION_DATA[filters.country] ? opts(Object.keys(LD.LOCATION_DATA[filters.country])) : []}
                        value={filters.state}
                        disabled={!filters.country}
                        onChange={(e) => {
                            const newState = e.target.value;
                            setFilters(prev => ({ ...prev, state: newState, city: '' }));
                        }}
                    />

                    <Select
                        label="City"
                        options={filters.country && filters.state && LD.LOCATION_DATA[filters.country][filters.state] ? opts(LD.LOCATION_DATA[filters.country][filters.state]) : []}
                        value={filters.city}
                        disabled={!filters.state}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                    />
                </div>

                {/* Advanced Filters (Collapsible) */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                        <Select
                            label="Sect"
                            options={[{ label: 'All Sects', value: '' }, { label: 'Sunni', value: 'Sunni' }, { label: 'Shia', value: 'Shia' }]}
                            value={filters.sect}
                            onChange={(e) => handleFilterChange('sect', e.target.value)}
                        />
                        <Select
                            label="Caste"
                            options={opts(C.CASTES)}
                            value={filters.caste}
                            onChange={(e) => handleFilterChange('caste', e.target.value)}
                        />
                        <Select
                            label="Min Height"
                            options={opts(C.HEIGHTS)}
                            value={filters.min_height}
                            onChange={(e) => handleFilterChange('min_height', e.target.value)}
                        />
                        <Select
                            label="Education"
                            options={opts(C.EDUCATIONS)}
                            value={filters.education}
                            onChange={(e) => handleFilterChange('education', e.target.value)}
                        />
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <Button className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm" onClick={fetchProfiles}>Apply Filters</Button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Recommended Matches</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No profiles found matching your criteria.</p>
                        <Button variant="ghost" className="mt-2 text-primary" onClick={() => setFilters({
                            city: '', sect: '', caste: '', marital_status: '', min_age: '', max_age: '', min_height: '', education: '', country: '', state: ''
                        }) || fetchProfiles()}>
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="relative h-64 bg-slate-200">
                                    {profile.image_url ? (
                                        <img
                                            src={`http://localhost:8000${profile.image_url}`}
                                            alt={profile.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 text-6xl">
                                            {profile.gender === 'Female' ? '👩' : '👨'}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-xl font-bold">{profile.name}, {calculateAge(profile.dob)}</h3>
                                        <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <p>{profile.location_city}, {profile.country}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Briefcase className="w-4 h-4 text-primary shrink-0" />
                                        <span className="truncate">{profile.profession || 'Not Specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Heart className="w-4 h-4 text-primary shrink-0" />
                                        <span>{profile.marital_status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <BookOpen className="w-4 h-4 text-primary shrink-0" />
                                        <span>{profile.sect} - {profile.caste}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Ruler className="w-4 h-4 text-primary shrink-0" />
                                        <span>{profile.height}</span>
                                    </div>

                                    <div className="pt-4 flex gap-2">
                                        <Button className="flex-1" size="sm" onClick={() => handleConnect(profile)}>Connect</Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`/profile/${profile.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConnectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profileId={selectedProfile?.id}
                profileName={selectedProfile?.name}
            />
        </div>
    );
}

function calculateAge(dobString) {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

