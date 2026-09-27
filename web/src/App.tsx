import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Features } from './components/Features'
import { DashboardPreview } from './components/dashboard/DashboardPreview'
import { DashboardShell } from './components/dashboard/DashboardShell'
import { Impact } from './components/Impact'
import { Footer } from './components/Footer'
import { StudentAnalysis } from './pages/StudentAnalysis'
import { Requests } from './pages/Requests'
import { Schedule } from './pages/Schedule'

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <DashboardPreview />
        <Impact />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<Navigate to="analysis" replace />} />
          <Route path="analysis" element={<StudentAnalysis />} />
          <Route path="requests" element={<Requests />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
