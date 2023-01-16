import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import { baseUrl } from './const';

export const validateId = (url: string | undefined) => {
  if (url) {
    const urlArr = url.split('/');
    const baseUrlFromRequest = `/${urlArr[1]}/${urlArr[2]}`;
    const id = urlArr[3];

    if (baseUrlFromRequest === baseUrl && uuidValidate(id) && uuidVersion(id) === 4) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
