import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ReviewPage } from './pages/ReviewPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatusPage } from './pages/StatusPage';
import { ComparePage } from './pages/ComparePage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
