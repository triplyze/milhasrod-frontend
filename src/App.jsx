import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '@/components/Header.jsx'
import AuthModal from '@/components/AuthModal.jsx'
import SearchPage from '@/pages/SearchPage.jsx'
import TripDetailPage from '@/pages/TripDetailPage.jsx'
import { Toaster } from 'sonner'
import './App.css'

function AppLayout() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onOpenAuthModal={() => setAuthModalOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<SearchPage onOpenAuthModal={() => setAuthModalOpen(true)} />} />
          <Route path="/detail/:availabilityId" element={<TripDetailPage />} />
        </Routes>
      </main>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
      <Toaster richColors closeButton position="top-right" />
    </Router>
  )
}

export default App
