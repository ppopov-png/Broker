import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
