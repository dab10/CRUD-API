import { validate as uuidValidate } from 'uuid';

export const validateId = (url: string | undefined) => {
  if (url) {
    const urlArr = url.split('/');
    const baseUrl = `/${urlArr[1]}/${urlArr[2]}`;
    const id = urlArr[3];

    if (baseUrl === '/api/users' && uuidValidate(id)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
