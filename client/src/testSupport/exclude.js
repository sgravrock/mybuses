import requireHacker from 'require-hacker'
requireHacker.hook('css', () => 'module.exports = ""');
requireHacker.hook('svg', () => 'module.exports = ""');
requireHacker.hook('png', () => 'module.exports = ""');
