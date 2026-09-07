import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../../shared/lib/session'

/**
 * Без сессии кабинет не открывается. Гард нужен и после выхода: иначе кнопка
 * «Назад» возвращала бы на страницу счёта уже вышедшего пользователя.
 */
export function RequireAuth() {
  const session = useSession()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
