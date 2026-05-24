interface GameTrailerViewsProps {
	gameName: string;
}

const GameTrailerViews = ({ gameName }: GameTrailerViewsProps) => {
	return <div>GameTrailerViews for {gameName}</div>;
};

export default GameTrailerViews;
