import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { StarProvider } from './context/StarContext';
import { Layout } from './components/Layout';
import { TeamOverview } from './views/TeamOverview';
import { RoleList } from './views/RoleList';
import { ProjectsList } from './views/ProjectsList';
import { ProjectDetail } from './views/ProjectDetail';
import { PersonDetail } from './views/PersonDetail';
import { SquadDetail } from './views/SquadDetail';
import { ImportData } from './views/ImportData';
import { RepoDetail } from './views/RepoDetail';
import { ReposList } from './views/ReposList';
import { SearchResults } from './views/SearchResults';
import './layout.css';
import './styles.css';

export function App() {
	return (
		<StarProvider>
		<DataProvider>
			<HashRouter>
				<Layout>
					<Routes>
						<Route path='/' element={<TeamOverview />} />
						<Route path='/roles' element={<RoleList />} />
						<Route path='/projects' element={<ProjectsList />} />
						<Route path='/project/:id' element={<ProjectDetail />} />
						<Route path='/person/:id' element={<PersonDetail />} />
						<Route path='/squad/:id' element={<SquadDetail />} />
						<Route path='/repos' element={<ReposList />} />
						<Route path='/repo/:id' element={<RepoDetail />} />
						<Route path='/import' element={<ImportData />} />
						<Route path='/search' element={<SearchResults />} />
					</Routes>
				</Layout>
			</HashRouter>
		</DataProvider>
		</StarProvider>
	);
}
