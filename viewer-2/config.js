const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync('../config.yml', 'utf8'));

module.exports = {
  siteTitle: config.siteTitle,
  siteDescription: config.siteDescription
}
