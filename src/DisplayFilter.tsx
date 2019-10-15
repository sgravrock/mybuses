import React, {createContext, FC, useContext, useState} from 'react';

export interface DisplayFilter {
	showOnly15: boolean;
	setShowOnly15: (value: boolean) => void;
}

const DisplayFilterContext = createContext<DisplayFilter>(null!);

export const DisplayFilterProvider: FC<{}> = props => {
	const [showOnly15, setShowOnly15] = useState<boolean>(false);

	return (
		<DisplayFilterContext.Provider value={{showOnly15, setShowOnly15}}>
			{props.children}
		</DisplayFilterContext.Provider>
	);
};

export function useDisplayFilter(): DisplayFilter {
	const value = useContext(DisplayFilterContext);

	if (!value) {
		throw new Error("useDisplayFilter() must be inside a DisplayFilterProvider");
	}

	return value;
}