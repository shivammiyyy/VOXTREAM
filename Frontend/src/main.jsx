import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'

const AppWithSocket = ()=>{
  const {user,loading} = useAuth();
  if(loading) return <p>Loading...</p>
  return <SocketProvider user = {user}><App /></SocketProvider>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <AppWithSocket />
      </Router>
    </AuthProvider>
  </StrictMode>,
)
