import Nav from './Nav';

interface HeaderProps {
	gameName: string;
}

const Header = ({ gameName }: HeaderProps) => {
	return (
		<div className="header">
			<Nav />
			<h1 className="title">
				{gameName}
				<br />
				<span>Trailer</span>
				<br />
				Views
			</h1>
			<p className="subtitle">Combined video performance dashboard</p>
		</div>
	);
};

export default Header;
