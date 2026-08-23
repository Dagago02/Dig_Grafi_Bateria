import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Evaluations } from './pages/Evaluations';
import { Participants } from './pages/Participants';
import { Digitador } from './pages/Digitador';
import { Results } from './pages/Results';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/digitador/:participantId" element={<Digitador />} />
          <Route path="/results" element={<Results />} />
          {/* Fallback route */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
