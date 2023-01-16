import * as http from "http";
import 'dotenv/config';
import { getUsers, getUser, createUser, updateUser, deleteUser } from "./controllers/controller";
import { apiUrl, baseUrl, Errors, HttpStatusCode, usersUrl } from "./utils/const";

export const startServer = (PORT: number) => {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === baseUrl && req.method === 'GET') {
        await getUsers(req, res);
      } else if (req.url === baseUrl && req.method === 'POST') {
        await createUser(req, res); 
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'GET') {
        const id = req.url.split('/')[3];
        await getUser(req, res, id);
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'PUT') {
        const id = req.url.split('/')[3];
        await updateUser(req, res, id);
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'DELETE') {
        const id = req.url.split('/')[3];
        await deleteUser(req, res, id);
      } else if (
          (req.url === baseUrl && req.method !== 'GET') || 
          (req.url === baseUrl && req.method !== 'POST') ||
          (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && !['GET', 'PUT', 'DELETE'].some((item) => item === req.method))
        ) {
        res.writeHead(HttpStatusCode.NotImplemented, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: HttpStatusCode.NotImplemented, message: Errors.MethodNotSupport}));
      } else {
        res.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.RouteNotFound}));
      }
    } catch {
      res.writeHead(HttpStatusCode.InternalServerError, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: HttpStatusCode.InternalServerError, message: Errors.ServerError}));
    }
  });
  
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  process.on('SIGINT', () => {
    console.log(`Server stopping on port ${PORT}`);
    server.close(() => {
      process.exit();
    })
    process.exit();
  }) 

  return server;
}

