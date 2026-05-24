import { formatViews } from '../helpers';
import CounterAnimation from './CounterAnimation';

interface TotalViewsProps {
	totalViews: number | null;
}

const TotalViews = ({ totalViews }: TotalViewsProps) => {
	return (
		<div className="total-block">
			<div className="total-label">◈ Total Combined Views</div>
			<div className="total-value">
				{totalViews !== null ? (
					<CounterAnimation value={totalViews} />
				) : (
					<div className="loading-shimmer" style={{ height: 60, width: 260 }} />
				)}
			</div>
			{totalViews !== null && (
				<div className="total-formatted">{formatViews(totalViews)} views combined</div>
			)}
		</div>
	);
};

export default TotalViews;
