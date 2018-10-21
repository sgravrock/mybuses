const jasmineEnzyme = require('jasmine-enzyme');
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

beforeEach(function() {
  jasmineEnzyme();
});