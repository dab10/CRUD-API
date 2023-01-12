import * as http from "http";
import * as database from "../models/model";
import { User } from "../userDB/userDB";
import { Errors, HttpStatusCode, ValidateBodyRequestStatus } from "../utils/const";
import { getUserData } from "../utils/getUserData";
import { validateBodyRequest } from "../utils/validateBodyRequest";
import { validateId } from "../utils/validateId";

export const getUsers = async (_: http.IncomingMessage, res: http.ServerResponse) => {
    const users = await database.findAll();
    res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
}

export const getUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {

    if (validateId(req.url)) {
      const user = await database.findById(id);
      if (!user) {
        res.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.UserNotFound }));
      } else {
        res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } else {
      res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.InvalidUserId}));
    }
}

export const createUser = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const body = await getUserData(req);

    if (validateBodyRequest(body) === ValidateBodyRequestStatus.Ok) {
      const { username, age, hobbies} = JSON.parse(body);

      const user = { 
        username,
        age,
        hobbies 
      };

      const newUser = await database.create(user);

      res.writeHead(HttpStatusCode.Created, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(newUser));
  } else if (validateBodyRequest(body) === ValidateBodyRequestStatus.ErrorJsonParse) {
    res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.ErrorJsonParse}));
  } else {
    res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.NotValidateFields}));
  }
    
}

export const updateUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
    if (validateId(req.url)) {
      const user = await database.findById(id);
      if (!user) {
        res.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.UserNotFound }));
      } else {
        const body = await getUserData(req);
        if (validateBodyRequest(body) === ValidateBodyRequestStatus.Ok) {
          const { username, age, hobbies} = JSON.parse(body);

          const userFromDB: User  = { 
            username: username || user.username,
            age: age || user.age,
            hobbies: hobbies || user.hobbies,
          }

          const updateUser = await database.update(id, userFromDB);

          res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(updateUser));
        } else if (validateBodyRequest(body) === ValidateBodyRequestStatus.ErrorJsonParse) {
          res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.ErrorJsonParse}));
        } else {
          res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.NotValidateFields}));
        }
      }
    } else {
      res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.InvalidUserId}));
    }
}

export const deleteUser = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
    if (validateId(req.url)) {
      const user = await database.findById(id);

      if (!user) {
        res.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.UserNotFound }));
      } else {
        await database.remove(id);
        res.writeHead(HttpStatusCode.NoContent, { 'Content-Type': 'application/json' });
        res.end();
      }
    } else {
      res.writeHead(HttpStatusCode.BadRequest, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: HttpStatusCode.BadRequest, message: Errors.InvalidUserId}));
    }
}
