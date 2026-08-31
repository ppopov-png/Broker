import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientTypePage } from '../pages/client-type/ClientTypePage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientTypePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
