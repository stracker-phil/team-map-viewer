import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { TeamOverview } from './views/TeamOverview';
import { RoleList } from './views/RoleList';
import { ProjectDetail } from './views/ProjectDetail';
import { PersonDetail } from './views/PersonDetail';
import { SquadDetail } from './views/SquadDetail';
import { ImportData } from './views/ImportData';
import { SearchResults } from './views/SearchResults';
import './styles.css';

export function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<TeamOverview />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/person/:id" element={<PersonDetail />} />
            <Route path="/squad/:id" element={<SquadDetail />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
}
