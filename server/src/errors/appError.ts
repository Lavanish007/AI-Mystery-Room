export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class BadRequestError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string>, code: string = 'BAD_REQUEST') {
    super(400, code, message, fieldErrors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(409, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code: string = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class UpstreamAiError extends AppError {
  constructor(
    message: string = 'AI provider service is temporarily unavailable. Please retry your request.',
    code: string = 'UPSTREAM_AI_ERROR'
  ) {
    super(502, code, message);
  }
}

export class AiGenerationFailedError extends AppError {
  constructor(
    message: string = 'Generated mystery could not satisfy fairness and consistency rules after repair. Please try again.',
    code: string = 'GENERATION_VALIDATION_FAILED'
  ) {
    super(502, code, message);
  }
}
