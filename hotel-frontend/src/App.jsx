import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import SearchPage from './pages/SearchPage';
import BookingsPage from './pages/BookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content-wrapper">
            <header className="app-header">
              <div className="app-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Logo size="large" variant="default" />
                <span style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>Hotel</span>
              </div>
              <p>Find & Check Available Rooms</p>
            </header>
            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute requireAuth={false} disallowAdmin={true}>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute disallowAdmin={true}>
                      <BookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminBookingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
