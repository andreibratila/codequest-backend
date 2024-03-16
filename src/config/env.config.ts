export const EnvConfiguration = () => ({
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationTime: +process.env.JWT_EXPIRATION_TIME || 1800,

  // COOKIE
  cookieExpirationTime: +process.env.COOKIE_EXPIRATION_TIME || 1800000,
  cookieName: process.env.COOKIE_NAME || 'auth',

  // ADMIN
  adminUser: process.env.ADMIN_USER || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',

  // APP
  environment: process.env.NODE_ENV || 'development',
  port: +process.env.PORT,

  //DB
  dbDialect: process.env.DB_DIALECT,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbDatabase: process.env.DB_DATABASE,
  dbSynchronize: process.env.NODE_ENV === 'production' ? false : true,
});
