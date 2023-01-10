import * as http from "http";
import 'dotenv/config';
import { getUsers, getUser, createUser, updateUser, deleteUser } from "./controllers/controller";

const server = http.createServer((req, res) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    getUsers(req, res);
  } else if (req.url && req.url.match(/\/api\/users\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/) && req.method === 'GET') {
    const id = req.url.split('/')[3];
    getUser(req, res, id);
  } else if (req.url === '/api/users' && req.method === 'POST') {
    createUser(req, res); 
  } else if (req.url && req.url.match(/\/api\/users\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/) && req.method === 'PUT') {
    const id = req.url.split('/')[3];
    updateUser(req, res, id);
  } else if (req.url && req.url.match(/\/api\/users\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/) && req.method === 'DELETE') {
    const id = req.url.split('/')[3];
    deleteUser(req, res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route Not Found'}));
  }
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
