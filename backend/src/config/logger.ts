import { AsyncLocalStorage } from 'async_hooks';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Async Local Storage for trace ID
export const asyncLocalStorage = new AsyncLocalStorage<{ traceId: string; context?: string }>();

const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || require('os').hostname(),
    environment: process.env.NODE_ENV || 'development',
    service: 'riddhi-api',
    version: process.env.npm_package_version || '1.0.0',
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,environment,service,version,traceId,context',
        singleLine: true,
        levelFirst: true,
        messageFormat: '\x1b[95m{traceId}\x1b[0m|\x1b[96m{context}\x1b[0m|\x1b[37m{msg}\x1b[0m',
        hideObject: false,
      },
    },
  }),

  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.confirmPassword',
      'req.body.oldPassword',
      'req.body.newPassword',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[REDACTED]',
  },
};

export const logger = pino(loggerConfig);

// Enhanced logger with trace ID support
export const createTracedLogger = () => {
  const store = asyncLocalStorage.getStore();
  const traceId = store?.traceId || 'no-trace';
  const context = store?.context || 'app';

  return logger.child({ traceId, context });
};

// Helper function to format trace ID and context for display
const formatTraceDisplay = (traceId?: string, context?: string) => {
  const displayTraceId = traceId && traceId !== 'no-trace' ? traceId : '';
  const displayContext = context && context !== 'app' ? context : '';
  return { traceId: displayTraceId, context: displayContext };
};

// Global logger function that automatically includes trace ID
export const log = {
  trace: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).trace(obj || {}, msg);
  },
  debug: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).debug(obj || {}, msg);
  },
  info: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).info(obj || {}, msg);
  },
  warn: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).warn(obj || {}, msg);
  },
  error: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).error(obj || {}, msg);
  },
  fatal: (msg: string, obj?: any) => {
    const store = asyncLocalStorage.getStore();
    const { traceId, context } = formatTraceDisplay(store?.traceId, store?.context);
    return logger.child({ traceId, context }).fatal(obj || {}, msg);
  },
};

export const httpLoggerConfig = {
  logger,

  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },

  customSuccessMessage: (req: Request, _res: Response) => {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage: (req: Request, _res: Response, err: Error) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },

  customProps: (req: Request, _res: Response) => {
    const store = asyncLocalStorage.getStore();
    const traceId = store?.traceId && store.traceId !== 'no-trace' ? store.traceId : '';
    const context = store?.context && store.context !== 'app' ? store.context : '';

    return {
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id,
      traceId,
      context,
    };
  },

  autoLogging: {
    ignore: (req: Request) => {
      return req.url === '/' || req.url.startsWith('/health');
    },
  },
};

export const httpLogger = pinoHttp(httpLoggerConfig) as any;

// Middleware to inject trace ID into async local storage
export const traceMiddleware = (req: Request, _res: Response, next: any) => {
  // Always generate a new trace ID for each request
  const traceId = uuidv4().slice(0, 8);
  const context = 'http';

  // Inject trace ID into request for downstream use
  (req as any).traceId = traceId;

  // Run the rest of the request in the async local storage context
  asyncLocalStorage.run({ traceId, context }, () => {
    next();
  });
};

export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Helper function to run operations with custom context
export const withContext = <T>(
  contextData: { traceId?: string; context: string },
  operation: () => T,
): T => {
  const traceId =
    contextData.traceId ||
    asyncLocalStorage.getStore()?.traceId ||
    'ctx-' + Date.now().toString(36).slice(-4);
  const newContext = {
    traceId,
    context: contextData.context,
  };
  return asyncLocalStorage.run(newContext, operation);
};

export const LOG_LEVELS = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

export const setupGracefulShutdown = () => {
  const gracefulShutdown = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');

    logger.flush();

    setTimeout(() => {
      logger.fatal({ signal }, 'Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
