import {ComponentType, EnzymePropSelector, ReactWrapper, StatelessComponent} from "enzyme";

type EnzymeFindSelector<SP> =
	string
	| EnzymePropSelector
	| ComponentType<SP>
	| StatelessComponent<SP>;

export function findByText<SP>(
	searchRoot: ReactWrapper,
	selector: EnzymeFindSelector<SP>,
	text: string | RegExp
): ReactWrapper {
	const matches = searchRoot.findWhere(el => {
		return el.length === 1
			&& el.is(selector)
			&& !!el.text().match(text);
	});
	return matches.first();
}

export function findByLabelText(
	searchRoot: ReactWrapper,
	text: string | RegExp
): ReactWrapper {
	const label = findByText(searchRoot, 'label', text);

	if (label.length === 0) {
		return label;
	}

	const id = label.prop('htmlFor');

	if (id) {
		return searchRoot.find('#' + id);
	} else {
		return label.find('input');
	}
}