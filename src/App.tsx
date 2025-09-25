import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/auth/Login'
import { Dashboard } from './pages/Dashboard'
import { Drivers } from './pages/Drivers'
import { Enterprises } from './pages/Enterprises'
import { Contacts } from './pages/Contacts'
import { JobOffers } from './pages/JobOffers'
import './lib/i18n'
// import SurveysList from './pages/admin/SurveysList'
// import SurveyDetail from './pages/admin/SurveyDetail'

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="enterprises" element={<Enterprises />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="job-offers" element={<JobOffers />} />
          {/* <Route path="admin/surveys" element={<SurveysList />} /> */}
          {/* <Route path="admin/surveys/:id" element={<SurveyDetail />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App