import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import NewAssessment from './components/NewAssessment.jsx';
import AiAssessment from './components/AiAssessment.jsx';
import PastInsights from './components/PastInsights.jsx';
import FamilyMembers from './components/FamilyMembers.jsx';
import HealthInsights from './components/HealthInsights.jsx';
import Reports from './components/Reports.jsx';
import UploadReport from './components/UploadReport.jsx';
import GenerateReport from './components/GenerateReport.jsx';
import Doctors from './components/Doctors.jsx';
import AddDoctor from './components/AddDoctor.jsx';
import Medicines from './components/Medicines.jsx';
import AddMedicine from './components/AddMedicine.jsx';
import AddCheckup from './components/AddCheckup.jsx';
import PatientEducation from './components/PatientEducation.jsx';
import Settings from './components/Settings.jsx';
import AppShell from './layout/AppShell.jsx';
import { MemberProvider } from './memberContext.jsx';
import { AuthProvider } from './authContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RequireAuth from './pages/RequireAuth.jsx';
import { ROUTES } from './routes.js';

export default function App() {
  return (
    <AuthProvider>
      <MemberProvider>
        <Routes>
          <Route path={ROUTES.home} element={<LandingPage />} />
          <Route path={ROUTES.login} element={<Login />} />
          <Route path={ROUTES.register} element={<Register />} />
          <Route element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route path={ROUTES.dashboard} element={<Dashboard />} />
            <Route path={ROUTES.aiAssistant} element={<AiAssistant />} />
            <Route path={ROUTES.assessment} element={<NewAssessment />} />
            <Route path={ROUTES.insights} element={<AiAssessment />} />
            <Route path={ROUTES.pastInsights} element={<PastInsights />} />
            <Route path={ROUTES.family} element={<FamilyMembers />} />
            <Route path={ROUTES.health} element={<HealthInsights />} />
            <Route path={ROUTES.doctors} element={<Doctors />} />
            <Route path={ROUTES.doctorsAdd} element={<AddDoctor />} />
            <Route path={ROUTES.doctorsEdit} element={<AddDoctor />} />
            <Route path={ROUTES.medicines} element={<Medicines />} />
            <Route path={ROUTES.medicinesAdd} element={<AddMedicine />} />
            <Route path={ROUTES.medicinesEdit} element={<AddMedicine />} />
            <Route path={ROUTES.checkupsAdd} element={<AddCheckup />} />
            <Route path={ROUTES.checkupsEdit} element={<AddCheckup />} />
            <Route path={ROUTES.reports} element={<Reports />} />
            <Route path={ROUTES.reportsUpload} element={<UploadReport />} />
            <Route path={ROUTES.reportsEdit} element={<UploadReport />} />
            <Route path={ROUTES.generateReport} element={<GenerateReport />} />
            <Route path={ROUTES.education} element={<PatientEducation />} />
            <Route path={ROUTES.settings} element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </MemberProvider>
    </AuthProvider>
  );
}
