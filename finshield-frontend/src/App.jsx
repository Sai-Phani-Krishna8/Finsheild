import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Lock from './pages/Lock'
import Risk from './pages/Risk'
import Report from './pages/Report'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="lock" element={<Lock />} />
        <Route path="risk" element={<Risk />} />
        <Route path="report" element={<Report />} />
      </Route>
    </Routes>
  )
}