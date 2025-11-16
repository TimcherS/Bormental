import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CanvasProvider } from './contexts/CanvasContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CanvasSelectPage from './pages/CanvasSelectPage';
import CanvasPage from './pages/CanvasPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CanvasProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/canvas-select" element={<CanvasSelectPage />} />
              <Route path="/canvas" element={<CanvasPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CanvasProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
