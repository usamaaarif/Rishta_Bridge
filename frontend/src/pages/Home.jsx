import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Users, HeartHandshake } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    {/* Placeholder for Hero Image - would use a culturally appropriate wedding/couple image */}
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />

                <div className="relative z-20 max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Find Your Half of Faith with <br />
                        <span className="text-primary italic">Trust & Tradition</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto font-light">
                        The first matrimonial platform designed for the unique social, religious, and family dynamics of Pakistan. Verified profiles, sect-specific matching, and complete privacy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="px-8 py-4 bg-primary hover:bg-emerald-800 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
                            Create Your Profile
                        </Link>
                        <Link to="/search" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold text-lg transition-all">
                            Browse Matches
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why RishtaBridge?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            We bridge the gap between traditional matchmaking and modern convenience, removing the "Blind Trust" and replacing it with "Verified Compatibility".
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                                title: "100% Verified Profiles",
                                desc: "We manually verify every profile via phone and optional CNIC checks to ensure you are talking to real families, not bots."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-secondary" />,
                                title: "Deep Cultural Matching",
                                desc: "Filter not just by profession, but by Sect (Maslak), Caste (Biradari), and Family Values to find a truly compatible groom or bride."
                            },
                            {
                                icon: <HeartHandshake className="w-10 h-10 text-accent" />,
                                title: "Family-First Approach",
                                desc: "Designed for parents and guardians. Profile creators are clearly identified, and privacy controls protect our daughters' identities."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow group">
                                <div className="mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to complete your Sunnah?</h2>
                    <p className="text-slate-600 mb-8">Join thousands of Pakistani families who have found their perfect Rishta through us.</p>
                    <Link to="/register" className="inline-flex items-center gap-2 text-primary font-bold hover:text-emerald-800 underline decoration-2 underline-offset-4">
                        Get Started Now <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
