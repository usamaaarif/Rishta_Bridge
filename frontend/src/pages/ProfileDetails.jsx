import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowLeft, MapPin, Ruler, BookOpen, Briefcase, Heart, User, Users } from 'lucide-react';
import { Button } from '../components/ui';

export default function ProfileDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/${id}`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                alert("Profile not found");
                navigate('/search');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, navigate]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    if (!profile) return null;

    const Section = ({ title, icon: Icon, children }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {children}
            </div>
        </div>
    );

    const Item = ({ label, value }) => (
        <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{label}</span>
            <span className="text-slate-800 font-medium">{value || 'Not Specified'}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
                </Button>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="h-48 bg-gradient-to-r from-teal-600 to-emerald-600 relative">
                        {/* Cover Photo Area - Could be generic pattern */}
                    </div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="-mt-20 flex-shrink-0">
                                <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden">
                                    {profile.image_url ? (
                                        <img src={`http://localhost:8000${profile.image_url}`} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl bg-slate-100">
                                            {profile.gender === 'Female' ? '👩' : '👨'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 flex-1">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900">{profile.name} <span className="text-slate-400 font-normal text-xl">({profile.profile_creator})</span></h1>
                                        <p className="text-slate-500 flex items-center gap-1 mt-1">
                                            <MapPin className="w-4 h-4" /> {profile.location_city}, {profile.country}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className={connected ? "bg-green-600 hover:bg-green-700" : ""}
                                        onClick={() => setConnected(true)}
                                    >
                                        {connected ? "Request Sent ✓" : "Connect Now"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Basic Info */}
                    <Section title="Basic Details" icon={User}>
                        <Item label="Age / DOB" value={profile.dob} />
                        <Item label="Gender" value={profile.gender} />
                        <Item label="Marital Status" value={profile.marital_status} />
                        <Item label="Children" value={profile.children_count === 'None' ? 'No Children' : profile.children_count} />
                        <Item label="Height" value={profile.height} />
                        <Item label="Complexion" value={profile.complexion} />
                        <Item label="Mother Tongue" value={profile.mother_tongue} />
                        <Item label="Citizenship" value={profile.citizenship} />
                    </Section>

                    {/* Cultural */}
                    <Section title="Religious & Cultural" icon={BookOpen}>
                        <Item label="Religion" value={profile.religion} />
                        <Item label="Sect" value={profile.sect} />
                        <Item label="Caste" value={profile.caste} />
                        <Item label="Sub Caste" value={profile.sub_caste} />
                        <Item label="Religiousness" value={profile.religiousness} />
                    </Section>

                    {/* Education & Job */}
                    <Section title="Education & Career" icon={Briefcase}>
                        <Item label="Education" value={profile.education_level} />
                        <Item label="Profession" value={profile.profession} />
                        <Item label="Monthly Income" value={profile.monthly_income} />
                    </Section>

                    {/* Family */}
                    <Section title="Family Background" icon={Users}>
                        <Item label="Brothers" value={`${profile.brothers_count} (${profile.married_brothers_count} married)`} />
                        <Item label="Sisters" value={`${profile.sisters_count} (${profile.married_sisters_count} married)`} />
                        <div className="col-span-1 md:col-span-2">
                            <Item label="Family Description" value={profile.family_description} />
                        </div>
                    </Section>

                    {/* Partner Pref */}
                    <Section title="Partner Preference" icon={Heart}>
                        <Item label="Looking For" value={profile.partner_looking_for} />
                        <Item label="Age Range" value={`${profile.partner_age_min} - ${profile.partner_age_max} Years`} />
                        <Item label="Min Height" value={profile.partner_min_height} />
                        <Item label="Preferred Country" value={profile.partner_country} />
                    </Section>
                </div>

            </div>
        </div>
    );
}
