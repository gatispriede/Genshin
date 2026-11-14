import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Teams from './pages/Teams';
import LegacyPage from './pages/LegacyPage';
import Roadmap from './pages/Roadmap';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/characters/:name" element={<CharacterDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/roadmap" element={<Roadmap />} />
        {/* Everything not yet migrated renders as itself, framed by the shell. */}
        <Route path="/page/:href" element={<LegacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
