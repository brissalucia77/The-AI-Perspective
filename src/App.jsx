import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Survey from './pages/Survey'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="The AI Perspective home">
          <span className="brand-mark">AI</span>
          <span>The AI Perspective</span>
        </Link>
        <Link to="/dashboard" className="nav-link">Dashboard <span aria-hidden="true">↗</span></Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Survey />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">THE AI PERSPECTIVE <span>•</span> Understanding how students see the future of AI</footer>
    </>
  )
}
