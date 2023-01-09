import { database, UserDB, User } from "../userDB/userDB";

export const findAll = () => {
  return new Promise<UserDB>((resolve, reject) => {
    resolve(database);
  });
}

export const findById = (id: string) => {
  return new Promise<User | undefined>((resolve, reject) => {
    const user = database.users.find((item) => item.id === id);
    resolve(user);
  });
}
