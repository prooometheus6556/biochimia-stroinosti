import Hero from './components/Hero'
import Story from './components/Story'
import Benefits from './components/Benefits'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import LeadForm from './components/LeadForm'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Story />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <LeadForm />
      <Footer />
    </main>
  )
}
