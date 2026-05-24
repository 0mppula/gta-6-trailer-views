import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import GameTrailerViews from './components/GameTrailerViews.tsx';
import { GTA_5_TRAILER_VIDEO_IDS, GTA_6_TRAILER_VIDEO_IDS } from './constants';
import './styles/index.css';

const router = createBrowserRouter([
	{
		path: '/gta6',
		element: (
			<GameTrailerViews
				gameName="GTA 6"
				videoIds={GTA_6_TRAILER_VIDEO_IDS}
				accentColor="#d883c4"
			/>
		),
	},
	{
		path: '/gta5',
		element: (
			<GameTrailerViews
				gameName="GTA 5"
				videoIds={GTA_5_TRAILER_VIDEO_IDS}
				accentColor="#84c43b"
			/>
		),
	},
	{
		path: '*',
		element: <Navigate to="/gta6" replace />,
	},
]);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
