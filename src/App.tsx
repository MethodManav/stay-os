import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginSignup } from './components/LoginSignup';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Sidebar } from './components/Sidebar';
import { InboxTab } from './components/InboxTab';
import { BookingsTab } from './components/BookingsTab';
import { SettingsTab } from './components/SettingsTab';
import { isOnboardingCompleted } from './mockData';

// Dashboard layout wrapper with sidebar and nested views
const DashboardLayout: React.FC = () => {
  const [isOnboarded, setIsOnboarded] = useState(() => isOnboardingCompleted());

  const handleLogout = () => {
    // Clear onboarding data status and redirect to login
    localStorage.removeItem('stayos_onboarding_completed');
    setIsOnboarded(false);
    window.location.href = '/login';
  };

  // Redirect if onboarding not completed
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg-page text-text-primary">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="inbox" element={<InboxTab />} />
          <Route path="bookings" element={<BookingsTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route index element={<Navigate to="inbox" replace />} />
        </Route>
        {/* Wildcard redirects */}
        <Route 
          path="*" 
          element={
            isOnboardingCompleted() 
              ? <Navigate to="/dashboard/inbox" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
