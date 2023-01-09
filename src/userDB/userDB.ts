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
  users: [ {id: 'ab2536c9-18bb-43e9-9f99-bc35116418fc',
    username: 'string',
    age: 20,
    hobbies: []}]
};