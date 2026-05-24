import { NavLink } from 'react-router';
import { GTA_5_ACCENT_COLOR, GTA_6_ACCENT_COLOR } from '../constants';

const GAMES = [
	{ path: '/gta6', label: 'GTA VI', accent: GTA_6_ACCENT_COLOR },
	{ path: '/gta5', label: 'GTA V', accent: GTA_5_ACCENT_COLOR },
];

const Nav = () => {
	return (
		<nav className="nav">
			<div className="nav-channel-tag">⊞ Rockstar Games · YouTube</div>
			<div className="nav-links">
				{GAMES.map((game) => (
					<NavLink
						key={game.path}
						to={game.path}
						className={({ isActive }) =>
							`nav-link${isActive ? ' nav-link--active' : ''}`
						}
						style={({ isActive }) =>
							isActive
								? ({ '--link-accent': game.accent } as React.CSSProperties)
								: {}
						}
					>
						{game.label}
					</NavLink>
				))}
			</div>
		</nav>
	);
};

export default Nav;
