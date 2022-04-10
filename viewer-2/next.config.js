const config = yaml.safeLoad(fs.readFileSync('../config.yml', 'utf8'));

module.exports = {
  basePath: config.basePath,
}