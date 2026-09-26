import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Features } from './components/Features'
import { DashboardPreview } from './components/dashboard/DashboardPreview'
import { Impact } from './components/Impact'
import { Footer } from './components/Footer'

export default function App() {
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
