import { User } from "../userDB/userDB";
import { ValidateBodyRequestStatus } from "./const";

export const validateBodyRequest = (body: string) => {

  if (body) {
    try {
      JSON.parse(body);
    } catch (error) {
      if ((error as Error).name === 'SyntaxError') { 
        return ValidateBodyRequestStatus.ErrorJsonParse;
      } else {
        throw error;
      }
    }
    const bodyParsed: User = JSON.parse(body);
    const size = Object.keys(bodyParsed).length;
    const usernameKey = Object.keys(bodyParsed)[0];
    const ageKey = Object.keys(bodyParsed)[1];
    const hobbiesKey = Object.keys(bodyParsed)[2];
    const usernameValue = bodyParsed.username;
    const ageValue = bodyParsed.age;
    const hobbiesValue = bodyParsed.hobbies;
    if (
      size === 3 &&
      usernameKey === 'username' && 
      ageKey === 'age' && 
      hobbiesKey === 'hobbies' && 
      typeof usernameValue === 'string' &&
      typeof ageValue === 'number' &&
      Array.isArray(bodyParsed.hobbies) &&
      (bodyParsed.hobbies.length === 0 || hobbiesValue.every((item) => typeof item === 'string'))
    ) {
      return  ValidateBodyRequestStatus.Ok;
    } else {
      return ValidateBodyRequestStatus.ValidateError;
    }
  } else {
    return ValidateBodyRequestStatus.ValidateError;
  }
}