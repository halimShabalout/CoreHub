import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error occurred';

    switch (exception.code) {
      case 'P2000':
        message = 'Input value is too long for this field.';
        break;

      case 'P2002':
        message =
          'Duplicate value detected. A record with this value already exists.';
        break;

      case 'P2003':
        message = 'Foreign key constraint failed.';
        break;

      case 'P2004':
        message = 'A constraint validation failed in the database.';
        break;

      case 'P2005':
        message = 'Invalid value for a database field.';
        break;

      case 'P2006':
        message = 'Invalid value stored in database.';
        break;

      case 'P2011':
        message = 'Null constraint violation on non-null field.';
        break;

      case 'P2014':
        message = 'Relation violation. Check your relational logic.';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found.';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Unexpected database error.';
        break;
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      message,
      errorCode: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
