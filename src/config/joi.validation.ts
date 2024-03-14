import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  // JWT
  JWT_SECRET: Joi.required(),
  JWT_EXPIRATION_TIME: Joi.number().default(1800),

  // COOKIE
  COOKIE_EXPIRATION_TIME: Joi.number().default(1800000),
  COOKIE_NAME: Joi.string().default('auth'),

  // ADMIN
  ADMIN_USER: Joi.string().default(''),
  ADMIN_PASSWORD: Joi.string().default(''),

  // APP
  NODE_ENV: Joi.string().default('development'),
  POSTGREDB: Joi.required(),
  PORT: Joi.number().default(3001),
});
