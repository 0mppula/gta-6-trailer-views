import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../helpers';

interface CounterAnimationProps {
	value: number | null;
}

const CounterAnimation = ({ value }: CounterAnimationProps) => {
	const [display, setDisplay] = useState(value);
	const prevRef = useRef(value);

	useEffect(() => {
		if (value === null) return;
		const start = prevRef.current || 0;
		const end = value;
		const duration = 1200;
		const steps = 40;
		const increment = (end - start) / steps;
		let current = start;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			current += increment;
			if (step >= steps) {
				setDisplay(end);
				clearInterval(timer);
			} else {
				setDisplay(Math.round(current));
			}
		}, duration / steps);

		prevRef.current = end;
		return () => clearInterval(timer);
	}, [value]);

	return <span>{formatNumber(display)}</span>;
};

export default CounterAnimation;
