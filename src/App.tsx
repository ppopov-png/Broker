import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { BrokerRouter } from './app/router'
import { ThemeProvider } from './shared/theme'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <BrokerRouter />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
