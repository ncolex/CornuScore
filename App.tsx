import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewReviewPage from './pages/NewReviewPage';
import ResultsPage from './pages/ResultsPage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/review" element={<NewReviewPage />} />
          <Route path="/results/:query" element={<ResultsPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;