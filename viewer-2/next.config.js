import { fs } from 'fs';
import { yaml } from 'js-yaml';

const config = yaml.load(fs.readFileSync('../config.yml', 'utf8'));

module.exports = {
  basePath: config.basePath,
}