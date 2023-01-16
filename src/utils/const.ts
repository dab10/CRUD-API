export const apiUrl = 'api';
export const usersUrl = 'users';
export const baseUrl = '/api/users';

export enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500, 
  NotImplemented = 501
}

export enum Errors {
  RouteNotFound = 'Route not found',
  ServerError = 'Internal server error. Please try again',
  InvalidUserId = 'User id is invalid',
  UserNotFound = 'User not found',
  MethodNotSupport = 'Server does not support entered request with such request method',
  NotValidateFields = 'Body does not contain required fields (username, age, hobbies) or order of properties is broken or properties do not match data types',
  ErrorJsonParse = 'Unexpected character of JSON data'
}

export enum ValidateBodyRequestStatus {
  Ok = 'validate OK',
  ErrorJsonParse = 'error JSON parse',
  ValidateError = 'validate error'
}
