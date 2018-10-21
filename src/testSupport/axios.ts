import {AxiosResponse} from "axios";

interface PartialResponse<T> {
	data: T,
	status?: number
}

export function makeAxiosResponse<T>(partialResponse: PartialResponse<T>): AxiosResponse<T> {
	return {
		status: 200,
		statusText: '',
		headers: [],
		config: {},
		...partialResponse
	};
}