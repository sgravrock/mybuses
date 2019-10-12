import React from 'react';
import {mount} from "enzyme";
import {findByText, findByLabelText} from "./queries";

describe('queries', () => {
	describe('findByText', () => {
		it('finds the first element with the specified tag name and text', () => {
			const root = mount(
				<div>
					<p>foo</p>
					<p id="target">bar</p>
					<p>bar</p>
				</div>
			);

			const result = findByText(root, 'p', 'bar');

			expect(result).toHaveProp('id', 'target');
		});

		it('does not find elements without the specified text', () => {
			const root = mount(
				<div>
					<p>foo</p>
				</div>
			);

			const result = findByText(root, 'p', 'bar');

			expect(result.length).withContext('number of matches').toEqual(0);
		});

		it('does not find elements that do not match the specified selector', () => {
			const root = mount(
				<div>
					<p>foo</p>
				</div>
			);

			const result = findByText(root, 'span', 'foo');

			expect(result.length).withContext('number of matches').toEqual(0);
		});

		it('finds elements that contain the specified text as a substring', () => {
			const root = mount(
				<div>
					<p id="target">foobarbaz</p>
				</div>
			);

			const result = findByText(root, 'p', 'bar');

			expect(result).toHaveProp('id', 'target');
		});

		it('can use a regex', () => {
			const root = mount(
				<div>
					<p id="target">foobarbaz</p>
				</div>
			);

			const result = findByText(root, 'p', /bar/);

			expect(result).toHaveProp('id', 'target');
		});

		it('finds elements that match the specified component type and text', () => {
			const MyComponent = () => <div>foo</div>;
			const root = mount(
				<div>
					<MyComponent/>
				</div>
			);

			const result = findByText(root, MyComponent, 'foo');

			expect(result).toExist();
		});

		it('finds elements that match the specified props and text', () => {
			const MyComponent = (props: { foo: string }) => <div>baz</div>;
			const root = mount(
				<div>
					<MyComponent foo="bar"/>
				</div>
			);

			const result = findByText(root, {foo: 'bar'}, 'baz');

			expect(result).toExist();
		});
	});

	describe('findByLabelText', () => {
		it('finds the input with the matching label text by nesting', () => {
			const root = mount(
				<div>
					<label><input type="checkbox" /> foo</label>
					<label><input type="checkbox" id="target" /> bar</label>
				</div>
			);

			const result = findByLabelText(root, 'bar');

			expect(result).toHaveProp('id', 'target');
		});

		it('finds the input with the matching label text by for= linking', () => {
			const root = mount(
				<div>
					<input type="checkbox" id="cb1" />
					<label htmlFor="cb1">foo</label>
					<input type="checkbox" id="cb2" />
					<label htmlFor="cb2">bar</label>
				</div>
			);

			const result = findByLabelText(root, 'bar');

			expect(result).toHaveProp('id', 'cb2');
		});

		it('returns an empty wrapper if the label is not found', () => {
			const root = mount(<div />);

			expect(findByLabelText(root, 'anything')).not.toExist();
		});

		it('returns an empty wrapper if the input is not found', () => {
			const root = mount(<div><label>foo</label></div>);

			expect(findByLabelText(root, 'foo')).not.toExist();
		});
	})
});