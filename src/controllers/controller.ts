import * as http from "http";
import * as database from "../models/model";
import { User } from "../userDB/userDB";
import { validateBodyRequest } from "../utils/validateBodyRequest";
import { validateId } from "../utils/validateId";

export const getUsers = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const users = await database.findAll();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } catch (error) {
    console.log(error);
  }
}

export const getUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
  try {
    if (validateId(req.url)) {
      const user = await database.findById(id);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: 'User Not Found' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 400, message: 'user id is invalid'}));
    }
  } catch (error) {
    console.log(error);
  }
}

export const createUser = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    })

    req.on('end', async () => {
      if (validateBodyRequest(body) === 'validate OK') {
        const { username, age, hobbies} = JSON.parse(body);

        const user  = { 
          username,
          age,
          hobbies 
        }
  
        const newUser = await database.create(user);
  
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newUser));
      } else if (validateBodyRequest(body) === 'error JSON parse') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: 'unexpected character of the JSON data'}));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: 'request body does not contain required fields (username, age, hobbies) or properties do not match data types'}));
      }
    }) 

  } catch (error) {
    console.log(error);
  }
}

export const updateUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
  try {

    const user = await database.findById(id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User Not Found' }));
    } else {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      })
  
      req.on('end', async () => {
        const { username, age, hobbies} = JSON.parse(body);
  
        const userFromDB: User  = { 
          username: username || user.username,
          age: age || user.age,
          hobbies: hobbies || user.hobbies,
        }
  
        const updateUser = await database.update(id, userFromDB);
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(updateUser));
      })
    }

  } catch (error) {
    console.log(error);
  }
}

export const deleteUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
  try {
    const user = await database.findById(id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User Not Found' }));
    } else {
      await database.remove(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `User ${id} removed` }));
    }

  } catch (error) {
    console.log(error);
  }
}
