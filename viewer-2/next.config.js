import * as fs from 'fs';
import * as yaml from 'js-yaml';

const config = yaml.load(fs.readFileSync('../config.yml', 'utf8'));

export default {
  basePath: config.basePath,
}