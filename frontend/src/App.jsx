import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import History from './pages/History';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/billing" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="inventory"  element={<PrivateRoute><Inventory /></PrivateRoute>} />
        <Route path="billing"    element={<Billing />} />
        <Route path="history"    element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="suppliers"  element={<PrivateRoute><Suppliers /></PrivateRoute>} />
        <Route path="purchases"  element={<PrivateRoute><Purchases /></PrivateRoute>} />
        <Route path="expenses"   element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="reports"    element={<PrivateRoute><Reports /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--modal-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: '12px', fontSize: '13.5px',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: 'white' } },
              error:   { iconTheme: { primary: '#f87171', secondary: 'white' } },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
