import { User } from "../userDB/userDB";
import { ValidateBodyRequestStatus } from "./const";

export const validateBodyRequest = (body: string, multi = false) => {

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
    let size;
    let idKey;
    let usernameKey;
    let ageKey;
    let hobbiesKey;
    let idValue;
    let usernameValue;
    let ageValue;
    let hobbiesValue;
    if (multi) {
      size = Object.keys(bodyParsed).length;
      idKey = Object.keys(bodyParsed)[0];
      usernameKey = Object.keys(bodyParsed)[1];
      ageKey = Object.keys(bodyParsed)[2];
      hobbiesKey = Object.keys(bodyParsed)[3];
      idValue = bodyParsed.id;
      usernameValue = bodyParsed.username;
      ageValue = bodyParsed.age;
      hobbiesValue = bodyParsed.hobbies;

      if (
        size === 4 &&
        idKey === 'id' &&
        usernameKey === 'username' && 
        ageKey === 'age' && 
        hobbiesKey === 'hobbies' && 
        typeof idValue === 'string' &&
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
      size = Object.keys(bodyParsed).length;
      usernameKey = Object.keys(bodyParsed)[0];
      ageKey = Object.keys(bodyParsed)[1];
      hobbiesKey = Object.keys(bodyParsed)[2];
      usernameValue = bodyParsed.username;
      ageValue = bodyParsed.age;
      hobbiesValue = bodyParsed.hobbies;

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
    }
  } else {
    return ValidateBodyRequestStatus.ValidateError;
  }
}