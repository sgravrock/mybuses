import jasmineEnzyme from 'jasmine-enzyme';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });

beforeEach(function() {
  jasmineEnzyme();
});

export const isolatedModulesWorkaround = null;