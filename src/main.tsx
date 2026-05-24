import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import App from './App.tsx';
import GameTrailerViews from './GameTrailerViews.tsx';
import './styles/index.css';

const router = createBrowserRouter([
	{
		path: '/gta6',
		element: <App />,
	},
	{
		path: '/gta5',
		element: <GameTrailerViews gameName="GTA 5" />,
	},
	{
		path: '*',
		element: <Navigate to="/gta6" replace />,
	},
]);

// add fall back for root element not found redirect to / page
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
