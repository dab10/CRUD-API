import http from "http";
import * as database from "../models/model";
import { User } from "../userDB/userDB";

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
    const user = await database.findById(id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User Not Found' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    }

  } catch (error) {
    console.log(error);
  }
}