interface HeaderProps {
	gameName: string;
}

const Header = ({ gameName }: HeaderProps) => {
	return (
		<div className="header">
			<div className="channel-tag">⊞ Rockstar Games · YouTube</div>
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
