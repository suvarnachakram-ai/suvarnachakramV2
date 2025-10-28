import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import CursorTrail from './components/CursorTrail';
import Home from './pages/Home';
import Results from './pages/Results';
import ResultsBySlot from './pages/ResultsBySlot';
import News from './pages/News';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { useAdmin } from './hooks/useAdmin';
import { useData } from './context/DataContext';

function App() {
  // All hooks must be called first, before any conditional logic
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const { loading: dataLoading } = useData();
  const [showLoading, setShowLoading] = useState(true);

  // Combine loading states
  const isLoading = adminLoading || dataLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (showLoading) {
    return <LoadingSpinner onComplete={() => setShowLoading(false)} />;
  }

  return (
    <div>
      <CursorTrail />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={isAuthenticated ? <Admin /> : <AdminLogin />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route index element={<Home />} />
              <Route path="results" element={<Results />} />
              <Route path="results/:slot" element={<ResultsBySlot />} />
              <Route path="news" element={<News />} />
              <Route path="help" element={<Help />} />
              <Route path="contact" element={<Contact />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </div>
  );
}

export default App;