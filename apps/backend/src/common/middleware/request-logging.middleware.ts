import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip, headers } = req;
    const requestId = headers['x-request-id'] as string;
    const now = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsed = Date.now() - now;
      const logMessage = `${method} ${url} ${statusCode} ${elapsed}ms - ${ip || 'unknown'} ${requestId ? `[${requestId}]` : ''}`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
