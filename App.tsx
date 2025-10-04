import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewReviewPage from './pages/NewReviewPage';
import ResultsPage from './pages/ResultsPage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const mainClassName = 'flex-grow container mx-auto px-4 py-8';

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen font-sans">
        <Header />
        <main className={mainClassName}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/review" element={<PrivateRoute><NewReviewPage /></PrivateRoute>} />
            <Route path="/results/:query" element={<ResultsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/ai-generator" element={<PrivateRoute><AIGeneratorPage /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
