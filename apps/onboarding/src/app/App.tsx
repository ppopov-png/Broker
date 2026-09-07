import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientTypePage } from '../pages/client-type/ClientTypePage'
import { RegisterPage } from '../pages/register/RegisterPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientTypePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
