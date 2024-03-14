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
  postgreDB: process.env.POSTGREDB,

  //DB
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
});
