import {useEffect, useState} from 'react';

export function useTime(updateFreqMillis: number): Date {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const intervalId = setInterval(
			() => setCurrentTime(new Date())
			, updateFreqMillis
		);
		return () => clearInterval(intervalId);
	}, []);

	return currentTime
}