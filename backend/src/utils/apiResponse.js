export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  return res.status(statusCode).json(
    new ApiResponse(statusCode, data, message)
  );
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    errors,
    success: false,
  });
};
