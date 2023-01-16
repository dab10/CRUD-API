import { database, UserDB, User } from "../userDB/userDB";
import { v4 as uuidv4 } from 'uuid';

export const findAll = () => {
  return new Promise<UserDB>((resolve, _) => {
    resolve(database);
  });
};

export const findById = (id: string) => {
  return new Promise<User | undefined>((resolve, _) => {
    const user = database.users.find((item) => item.id === id);
    resolve(user);
  });
};

export const create = (user: User, multi = false) => {
  return new Promise<User>((resolve, _) => {
    let newUser;
    if (multi) {
      newUser = {...user};
    } else {
      newUser = {id: uuidv4(), ...user};
    }
    database.users.push(newUser);
    resolve(newUser);
  });
};

export const update = (id: string, user: User) => {
  return new Promise<User | undefined>((resolve, _) => {
    const index = database.users.findIndex((item) => item.id === id);
    database.users[index] = {id, ...user};
    resolve(database.users[index]);
  });
};

export const remove = (id: string) => {
  return new Promise<void>((resolve, _) => {
    database.users = database.users.filter((item) => item.id !== id);
    resolve();
  });
};
