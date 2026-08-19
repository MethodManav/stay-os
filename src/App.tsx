import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import { LoginSignup } from './components/LoginSignup';
import { Onboarding } from './components/Onboarding';
import { SaaSMarketing } from './components/SaaSMarketing';
import { DashboardLayout } from './components/DashboardApp';
import { DashboardTab } from './components/DashboardTab';
import { BookingsTab } from './components/BookingsTab';
import { RoomsTab } from './components/RoomsTab';
import { CustomersTab } from './components/CustomersTab';
import { WebsiteTab } from './components/WebsiteTab';
import { AiTab } from './components/AiTab';
import { PaymentsTab } from './components/PaymentsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { TeamTab } from './components/TeamTab';
import { SettingsTab } from './components/SettingsTab';
import { PublicSite } from './components/PublicSite';
import { AdminPanel } from './components/AdminPanel';

// Auth Route Guard wrapper
const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { onboardingCompleted } = useApp();
  if (!onboardingCompleted) {
    return <Navigate to="/signup" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Website */}
          <Route path="/" element={<SaaSMarketing currentTab="home" />} />
          <Route path="/pricing" element={<SaaSMarketing currentTab="pricing" />} />
          <Route path="/features" element={<SaaSMarketing currentTab="features" />} />
          <Route path="/solutions/hotels" element={<SaaSMarketing currentTab="solutions" />} />
          
          {/* Auth and Onboarding */}
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/signup" element={<Onboarding />} />
          <Route path="/onboarding" element={<Navigate to="/signup" replace />} />
          
          {/* Application Portal */}
          <Route 
            path="/app" 
            element={
              <OnboardingGuard>
                <DashboardLayout />
              </OnboardingGuard>
            }
          >
            <Route path="dashboard" element={<DashboardTab />} />
            <Route path="bookings" element={<BookingsTab />} />
            <Route path="rooms" element={<RoomsTab />} />
            <Route path="customers" element={<CustomersTab />} />
            <Route path="website" element={<WebsiteTab />} />
            <Route path="ai" element={<AiTab />} />
            <Route path="payments" element={<PaymentsTab />} />
            <Route path="analytics" element={<AnalyticsTab />} />
            <Route path="team" element={<TeamTab />} />
            <Route path="settings" element={<SettingsTab />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Public Hotel Site Portal */}
          <Route path="/site/:subdomain" element={<PublicSite />} />

          {/* Super Admin Panel Portal */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Fallback Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
