import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    //TODO: switch to true in production
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
      pool: { min: 0, max: 20 } // https://github.com/medusajs/medusa/issues/10729
    },
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.WORKER_MODE as "shared" | "worker" | "server") || "shared",
  },
  plugins: [
    `@georgi-valkov/medusa-notification-nodemailer`
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.CACHE_REDIS_URL,
              connectTimeout: 10000, // 10 seconds
              keepAlive: 60000, // 60 seconds
              retryStrategy: (times) => {
                // Exponential backoff for retries
                return Math.min(times * 50, 2000);
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              // other options...
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@georgi-valkov/medusa-notification-nodemailer/providers/notification-nodemailer",
            id: "notification-nodemailer",
            options: {
              type: "SES",
              channels: ["email"],
              from: process.env.SMTP_FROM || process.env.SES_FROM,
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT,
              secure: true,
              username: process.env.SMTP_USER,
              password: process.env.SMTP_PASS,
              region: process.env.SES_REGION,
              accessKeyId: process.env.SES_ACCESS_KEY,
              secretAccessKey: process.env.SES_SECRET_KEY,
            }
          },
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: ["feed"], // <-- Make sure "feed" is included here
            },
          }
        ]
      }
    },
  ]
})
