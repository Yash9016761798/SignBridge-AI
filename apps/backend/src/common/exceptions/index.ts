import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(message = 'Resource not found', resource?: string) {
    super(
      {
        success: false,
        message: resource ? `${resource} not found` : message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message = 'Resource already exists', details?: string) {
    super(
      {
        success: false,
        message: details || message,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: Array<{ field?: string; message: string; code?: string }>) {
    super(
      {
        success: false,
        message: 'Validation failed',
        errors,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Authentication required') {
    super(
      {
        success: false,
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Insufficient permissions') {
    super(
      {
        success: false,
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad request', details?: string) {
    super(
      {
        success: false,
        message: details || message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InternalServerException extends HttpException {
  constructor(message = 'Internal server error') {
    super(
      {
        success: false,
        message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
