import jasmineEnzyme from 'jasmine-enzyme';
import { configure } from 'enzyme';
import Adapter from './ReactSixteenAdapter';

configure({ adapter: new Adapter() });

beforeEach(function() {
  jasmineEnzyme();
});
