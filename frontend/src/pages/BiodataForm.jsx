import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../components/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as C from '../lib/constants';
import * as LD from '../lib/locationData';
import api from '../lib/api';

import ImageUpload from '../components/ImageUpload';

export default function BiodataForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            if (editId) {
                try {
                    const res = await api.get(`/profiles/${editId}`);
                    if (res.data) {
                        const sanitizedData = {};
                        Object.keys(res.data).forEach(key => {
                            sanitizedData[key] = res.data[key] === null || res.data[key] === undefined ? '' : res.data[key];
                        });

                        setFormData(prev => ({
                            ...prev,
                            ...sanitizedData
                        }));
                        setIsEditing(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    alert("Could not load profile to edit.");
                }
            }
            // If NO editId, we start fresh (do nothing), user can create new profile.
        };
        fetchProfile();
    }, [editId]);

    const [formData, setFormData] = useState({
        // 1. Basic Info
        profile_description: '',
        image_url: '',
        profile_creator: 'Self',
        name: 'Asif', // Default from HTML
        gender: 'Male',
        dob: '',
        mother_tongue: 'Urdu',
        email: 'asifali4748815@gmail.com',

        marital_status: 'Unmarried',
        children_count: 'None',
        children_living_with_me: 'No',

        // 2. Location
        country: 'Pakistan',
        state: 'Punjab(pakistan)',
        location_city: 'Lahore',
        citizenship: 'Pakistani',

        // 3. Appearance
        height: '5ft 6in',
        weight: '',
        complexion: '',
        body_type: '',
        smoke: '',
        drink: '',

        // 4. Cultural
        religion: 'Islam',
        sect: 'Sunni',
        caste: 'Arain',
        sub_caste: '',

        // 5. Education & Career
        education_level: 'Bachelors degree',
        profession: 'Business',
        monthly_income: '',

        // 6. Family
        religiousness: '',
        brothers_count: '0',
        married_brothers_count: '',
        sisters_count: '0',
        married_sisters_count: '',
        family_description: '',

        // 7. Partner Preference
        partner_looking_for: '',
        partner_age_min: '',
        partner_age_max: '',
        partner_country: '',
        partner_min_height: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        setLoading(true);
        console.log("Submitting:", formData);

        try {
            if (editId) {
                await api.put(`/profiles/${editId}`, formData);
                alert("Profile Updated Successfully!");
            } else {
                await api.post('/profiles/', formData);
                alert("New Profile Created Successfully!");
            }
            navigate('/dashboard');
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to save profile. " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div>Loading form data...</div>;

    // Helper to map simple arrays to options
    const opts = (arr) => (arr || []).map(v => ({ label: v, value: v }));
    // Helper for objects with label/value
    const optsObj = (arr) => (arr || []).map(v => ({ label: v.label, value: v.value }));

    const steps = [
        'Basic', 'Location', 'Appearance', 'Cultural',
        'Career', 'Family', 'Partner'
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Complete Your Profile</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Providing detailed information increases your chances of finding the perfect match by 5x.</p>
                </div>

                {/* Modern Stepper */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative px-2">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>

                        {steps.map((label, idx) => {
                            const isCompleted = step > idx + 1;
                            const isCurrent = step === idx + 1;

                            return (
                                <div key={label} className="flex flex-col items-center gap-2 bg-slate-50 px-2 first:pl-0 last:pr-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm
                                        ${isCurrent ? 'bg-primary text-white scale-110 ring-4 ring-primary/20' :
                                            isCompleted ? 'bg-primary text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                                        {isCompleted ? '✓' : idx + 1}
                                    </div>
                                    <span className={`text-xs font-semibold hidden sm:block ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">

                    {/* STEP 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
                                <p className="text-slate-500 text-sm mt-1">Tell us a bit about who you are.</p>
                            </div>

                            <div className="flex justify-center mb-6">
                                <ImageUpload
                                    initialImage={formData.image_url}
                                    onUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Profile Created By" name="profile_creator" options={opts(C.PROFILE_CREATORS)} value={formData.profile_creator} onChange={handleChange} />
                                <Input label="Name / Nickname" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Asif" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                                <Select label="Gender" name="gender" options={opts(['Male', 'Female'])} value={formData.gender} onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Marital Status" name="marital_status" options={optsObj(C.MARITAL_STATUSES)} value={formData.marital_status} onChange={handleChange} />
                                {/* Conditional Children Fields */}
                                {formData.marital_status !== 'Unmarried' && (
                                    <Select label="Children" name="children_count" options={optsObj(C.CHILDREN_COUNTS)} value={formData.children_count} onChange={handleChange} />
                                )}
                            </div>

                            {formData.marital_status !== 'Unmarried' && formData.children_count !== 'None' && formData.children_count !== '0' && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Do children live with you?</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-primary transition-colors">
                                                {formData.children_living_with_me === 'Yes' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <input type="radio" name="children_living_with_me" value="Yes" checked={formData.children_living_with_me === 'Yes'} onChange={handleChange} className="hidden" />
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-primary transition-colors">
                                                {formData.children_living_with_me === 'No' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <input type="radio" name="children_living_with_me" value="No" checked={formData.children_living_with_me === 'No'} onChange={handleChange} className="hidden" />
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">No</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="First Language" name="mother_tongue" options={opts(C.LANGUAGES)} value={formData.mother_tongue} onChange={handleChange} placeholder="Select Language" />
                                <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 2-7 Content (similar pattern) */}
                    {/* STEP 2: Location */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Location Details</h2>
                                <p className="text-slate-500 text-sm mt-1">Where do you currently reside?</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Country"
                                    name="country"
                                    options={opts(LD.COUNTRIES)}
                                    value={formData.country}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            country: e.target.value,
                                            state: '',
                                            location_city: ''
                                        }));
                                    }}
                                    placeholder="Select Country"
                                />
                                <Select
                                    label="State / Province"
                                    name="state"
                                    options={formData.country && LD.LOCATION_DATA[formData.country] ? opts(Object.keys(LD.LOCATION_DATA[formData.country])) : []}
                                    value={formData.state}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            state: e.target.value,
                                            location_city: ''
                                        }));
                                    }}
                                    disabled={!formData.country}
                                    placeholder="Select State"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="City"
                                    name="location_city"
                                    options={formData.country && formData.state && LD.LOCATION_DATA[formData.country] && LD.LOCATION_DATA[formData.country][formData.state] ? opts(LD.LOCATION_DATA[formData.country][formData.state]) : []}
                                    value={formData.location_city}
                                    onChange={handleChange}
                                    disabled={!formData.state}
                                    placeholder="Select City"
                                />
                                <Select label="Citizenship" name="citizenship" options={opts(C.CITIZENSHIPS)} value={formData.citizenship} onChange={handleChange} placeholder="Select Citizenship" />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Appearance */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Appearance & Lifestyle</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Height" name="height" options={opts(C.HEIGHTS)} value={formData.height} onChange={handleChange} />
                                <Select label="Weight" name="weight" options={opts(C.WEIGHTS)} value={formData.weight} onChange={handleChange} placeholder="Select Weight" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Complexion" name="complexion" options={opts(C.COMPLEXIONS)} value={formData.complexion} onChange={handleChange} placeholder="Select Complexion" />
                                <Select label="Body Type" name="body_type" options={opts(C.BODY_TYPES)} value={formData.body_type} onChange={handleChange} placeholder="Select Body Type" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Do you Smoke?" name="smoke" options={opts(C.SMOKE_DRINK_OPTIONS)} value={formData.smoke} onChange={handleChange} placeholder="Select..." />
                                <Select label="Do you Drink?" name="drink" options={opts(C.SMOKE_DRINK_OPTIONS)} value={formData.drink} onChange={handleChange} placeholder="Select..." />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Cultural */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Cultural & Religious</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Religion" name="religion" options={opts(C.RELIGIONS)} value={formData.religion} onChange={handleChange} />
                                <Select label="Sect" name="sect" options={opts(C.SECTS_SUNNI)} value={formData.sect} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Caste" name="caste" options={opts(C.CASTES)} value={formData.caste} onChange={handleChange} placeholder="Select Caste" />
                                <Input label="Sub-Caste (Optional)" name="sub_caste" value={formData.sub_caste} onChange={handleChange} placeholder="e.g. Chattha" />
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Edu/Career */}
                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Education & Profession</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Education Level" name="education_level" options={opts(C.EDUCATIONS)} value={formData.education_level} onChange={handleChange} />
                                <Select label="Occupation" name="profession" options={opts(C.OCCUPATIONS)} value={formData.profession} onChange={handleChange} placeholder="Select Profession" />
                            </div>
                            <div>
                                <Select label="Annual Income" name="monthly_income" options={opts(C.INCOMES)} value={formData.monthly_income} onChange={handleChange} placeholder="Select Income Range" />
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Family */}
                    {step === 6 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Family Details</h2>
                            </div>
                            <div className="w-full md:w-1/2">
                                <Select label="Religiousness of Family" name="religiousness" options={opts(C.RELIGIOUSNESS)} value={formData.religiousness} onChange={handleChange} placeholder="Select..." />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Siblings Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Select label="Brothers" name="brothers_count" options={opts(C.BROTHER_SISTER_COUNTS)} value={formData.brothers_count} onChange={handleChange} />
                                    <Select label="Married Bros" name="married_brothers_count" options={opts(C.MARRIED_SIBLING_COUNTS)} value={formData.married_brothers_count} onChange={handleChange} placeholder="Select" />
                                    <Select label="Sisters" name="sisters_count" options={opts(C.BROTHER_SISTER_COUNTS)} value={formData.sisters_count} onChange={handleChange} />
                                    <Select label="Married Sis" name="married_sisters_count" options={opts(C.MARRIED_SIBLING_COUNTS)} value={formData.married_sisters_count} onChange={handleChange} placeholder="Select" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 tracking-tight mb-2">Family Description</label>
                                <textarea name="family_description" rows="4" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm resize-none" placeholder="Write a few lines about your family values and background..." value={formData.family_description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: Partner */}
                    {step === 7 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Partner Preference</h2>
                                <p className="text-slate-500 text-sm mt-1">What are you looking for?</p>
                            </div>

                            <Select label="Looking For (Marital Status)" name="partner_looking_for" options={opts(C.LOOKING_FOR)} value={formData.partner_looking_for} onChange={handleChange} placeholder="Select Preference" />

                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Age From" name="partner_age_min" options={opts(C.AGES)} value={formData.partner_age_min} onChange={handleChange} placeholder="Min Age" />
                                <Select label="Age To" name="partner_age_max" options={opts(C.AGES)} value={formData.partner_age_max} onChange={handleChange} placeholder="Max Age" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select label="Country Living In" name="partner_country" options={opts(C.COUNTRIES)} value={formData.partner_country} onChange={handleChange} placeholder="Any / Select" />
                                <Select label="Minimum Height" name="partner_min_height" options={opts(C.HEIGHTS)} value={formData.partner_min_height} onChange={handleChange} placeholder="Select Height" />
                            </div>
                        </div>
                    )}

                    {/* NAV */}
                    <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-900">
                                ← Back
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        {step < 7 ? (
                            <Button onClick={() => setStep(step + 1)} size="lg" className="px-8 shadow-lg shadow-primary/20">
                                Next Step →
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20" isLoading={loading}>
                                Complete Profile
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
