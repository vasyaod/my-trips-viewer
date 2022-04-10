

const config = yaml.safeLoad(fs.readFileSync('../config.yml', 'utf8'));

module.exports = {
  siteTitle: config.siteTitle,
  siteDescription: config.siteDescription
}
