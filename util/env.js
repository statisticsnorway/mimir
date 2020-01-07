const environment = process.env.NODE_ENV;
// Consider `development` by default
module.exports = {
  prod: environment === 'production',
  dev: environment === 'development' || !environment,
  type: environment || 'development',
};