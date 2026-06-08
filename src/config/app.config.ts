import { registerAs } from '@nestjs/config';

export const appConfig    = registerAs('app',    () => ({ port: parseInt(process.env.PORT ?? '3000', 10), nodeEnv: process.env.NODE_ENV ?? 'development' }));
export const dbConfig     = registerAs('db',     () => ({ host: process.env.DB_HOST ?? 'localhost', port: parseInt(process.env.DB_PORT ?? '5432', 10), username: process.env.DB_USERNAME ?? 'postgres', password: process.env.DB_PASSWORD ?? 'postgres', name: process.env.DB_NAME ?? 'stockchef' }));
export const redisConfig  = registerAs('redis',  () => ({ host: process.env.REDIS_HOST ?? 'localhost', port: parseInt(process.env.REDIS_PORT ?? '6379', 10) }));
export const jwtConfig    = registerAs('jwt',    () => ({ secret: process.env.JWT_SECRET ?? 'stockchef-secret', expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' }));
