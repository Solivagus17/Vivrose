import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import NewAssessment from './components/NewAssessment.jsx';
import AiAssessment from './components/AiAssessment.jsx';
import FamilyMembers from './components/FamilyMembers.jsx';
import HealthInsights from './components/HealthInsights.jsx';
import Reports from './components/Reports.jsx';
import PatientEducation from './components/PatientEducation.jsx';
import Settings from './components/Settings.jsx';
import AppShell from './layout/AppShell.jsx';
import { MemberProvider } from './memberContext.jsx';
import { ROUTES } from './routes.js';

export default function App() {
  return (
    <MemberProvider>
      <Routes>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.assessment} element={<NewAssessment />} />
          <Route path={ROUTES.insights} element={<AiAssessment />} />
          <Route path={ROUTES.family} element={<FamilyMembers />} />
          <Route path={ROUTES.health} element={<HealthInsights />} />
          <Route path={ROUTES.reports} element={<Reports />} />
          <Route path={ROUTES.education} element={<PatientEducation />} />
          <Route path={ROUTES.settings} element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </MemberProvider>
  );
}
