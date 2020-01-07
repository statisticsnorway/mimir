const env = require('./util/env');

const isProd = env.prod;

const plugins = Object.assign(
{
"postcss-normalize": {},
autoprefixer: {}
},
isProd ? {cssnano: {}} : {}
);

module.exports = {plugins};
