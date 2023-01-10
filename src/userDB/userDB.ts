export type User = {
  id?: string;
  username: string;
  age: number;
  hobbies: string[];
};

export type UserDB = {
  users: User[];
}

export const database: UserDB = {
  users: []
};