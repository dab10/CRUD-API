import http from 'http';

export function getUserData(req: http.IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    try {
      let body = '';

      req.on('data', (chunk) => {
        try {
          body += chunk.toString();
        } catch {
          reject();
        }
      });

      req.on('end', () => {
        try {
          resolve(body);
        } catch {
          reject();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
