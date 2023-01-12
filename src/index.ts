import * as http from "http";
import 'dotenv/config';
import { getUsers, getUser, createUser, updateUser, deleteUser } from "./controllers/controller";

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/users' && req.method === 'GET') {
      await getUsers(req, res);
    } else if (req.url === '/api/users' && req.method === 'POST') {
      await createUser(req, res); 
    } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === 'api' && req.url.split('/')[2] === 'users' && req.method === 'GET') {
      const id = req.url.split('/')[3];
      await getUser(req, res, id);
    } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === 'api' && req.url.split('/')[2] === 'users' && req.method === 'PUT') {
      const id = req.url.split('/')[3];
      await updateUser(req, res, id);
    } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === 'api' && req.url.split('/')[2] === 'users' && req.method === 'DELETE') {
      const id = req.url.split('/')[3];
      await deleteUser(req, res, id);
    } else if (
        (req.url === '/api/users' && req.method !== 'GET') || 
        (req.url === '/api/users' && req.method !== 'POST') ||
        (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === 'api' && req.url.split('/')[2] === 'users' && !['GET', 'PUT', 'DELETE'].some((item) => item === req.method))
      ) {
      res.writeHead(501, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 501, message: `server does not support entered request with type of method ${req.method}`}));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 404, message: 'Route Not Found'}));
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 500, message: 'internal server error'}));
  }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
