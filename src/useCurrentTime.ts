// @ts-ignore
import {useEffect, useState} from 'react';

export function useCurrentTime(freqMS: number): Date {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const intervalId = setInterval(() => setCurrentTime(new Date()), freqMS);
		return () => clearInterval(intervalId);
	}, []);

	return currentTime;
}