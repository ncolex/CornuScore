import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewReviewPage from './pages/NewReviewPage';
import ResultsPage from './pages/ResultsPage';
import RankingPage from './pages/RankingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen font-sans bg-pink-50 dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/review" element={<NewReviewPage />} />
              <Route path="/results/:query" element={<ResultsPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;