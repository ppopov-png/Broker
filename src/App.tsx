import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { BrokerRouter } from './app/router'
import { ThemeProvider } from './shared/theme'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <BrokerRouter />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
