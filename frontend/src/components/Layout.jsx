import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, User, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Find Matches', path: '/search' },
        { name: 'About', path: '/about' },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-800 bg-clip-text text-transparent">
                                RishtaBridge
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        location.pathname === link.path ? "text-primary" : "text-slate-600"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex items-center gap-4 ml-4">
                                {!localStorage.getItem('token') ? (
                                    <div className="flex items-center gap-3">
                                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-all shadow-lg shadow-primary/20 hover:shadow-emerald-900/20 active:scale-95"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        {localStorage.getItem('role') === 'admin' && (
                                            <Link 
                                                to="/admin"
                                                className="flex items-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2 rounded-full font-bold transition-colors text-sm"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link 
                                            to="/dashboard"
                                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium transition-colors text-sm"
                                        >
                                            Dashboard
                                        </Link>
                                        <div className="relative group">
                                            <button
                                                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                                            >
                                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-primary font-bold">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">My Account</span>
                                            </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('token');
                                                    localStorage.removeItem('role');
                                                    navigate('/login');
                                                }}
                                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogIn className="w-4 h-4 mr-2 rotate-180" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "block px-3 py-2 rounded-md text-base font-medium",
                                        location.pathname === link.path
                                            ? "text-primary bg-primary/10"
                                            : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 px-3">
                                {!localStorage.getItem('token') ? (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 text-slate-600 font-medium"
                                        >
                                            <LogIn className="w-4 h-4" /> Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center bg-primary text-white py-2 rounded-lg font-medium"
                                        >
                                            Create Profile
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {localStorage.getItem('role') === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-2 text-rose-600 font-bold"
                                            >
                                                <User className="w-4 h-4" /> Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 text-slate-600 font-medium"
                                        >
                                            <User className="w-4 h-4" /> My Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('token');
                                                localStorage.removeItem('role');
                                                window.location.href = '/login';
                                            }}
                                            className="w-full text-center bg-red-50 text-red-600 py-2 rounded-lg font-medium border border-red-100"
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">RishtaBridge</h3>
                            <p className="text-sm leading-relaxed">
                                Reimagining the Pakistani matrimonial experience with trust, verified data, and cultural respect.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/search" className="hover:text-primary transition-colors">Browse Rishtas</Link></li>
                                <li><Link to="/about" className="hover:text-primary transition-colors">How it Works</Link></li>
                                <li><Link to="/pricing" className="hover:text-primary transition-colors">Membership</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link to="/trust" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li>support@rishtabridge.pk</li>
                                <li>+92 300 1234567</li>
                                <li>Islamabad, Pakistan</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
                        © 2025 RishtaBridge. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
