import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BiodataForm from './pages/BiodataForm';
import Search from './pages/Search';
import ProfileDetails from './pages/ProfileDetails';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="profile/:id" element={<ProfileDetails />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="register" element={<Register />} />
          <Route path="onboarding" element={<ErrorBoundary><BiodataForm /></ErrorBoundary>} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="*" element={<div className="p-10 text-center">404 - Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
