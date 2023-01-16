import 'dotenv/config';
import { startServer } from '../server';
import supertest from 'supertest';
import { User } from '../userDB/userDB';

const createUser = { 
  username: 'Anonym', 
  age: 14, 
  hobbies: ['hackers'] 
};
const updateUser = {
  username: 'Anonym',
  age: 15,
  hobbies: ['hackers', 'programming']
};
const badUser = { 
  username: 'Anonym', 
  age: 14, 
  hobbies: 'hackers' 
};
const badUserJSON = { 
  username: 'Anonym', 
  age: 14, 
  hobbies: ['hackers', 'programming']
};
const PORT = Number(process.env.PORT) || 4000;

const server = startServer(PORT);
const request = supertest(server);

afterAll(() => {
  server.close();
});

describe('API Tests', function () {
  describe('Scenario N1 - Get all users => Create user => Get create user => Update user => Delete updated => Get deleted', function () {
    let userId: string;

    it('should return empty array of users', async () => {
      await request.get('/api/users').expect(200, { users: [] });
    });

    it('should return created object of user with id', async () => {
      const res = await request.post('/api/users').send(createUser);
      expect(res.status).toEqual(201);
      expect(res.body).toEqual(
        expect.objectContaining({ id: expect.any(String), ...createUser })
      );
      userId = res.body.id;
    });

    it('should return object of user created in prev test', async () => {
      const res = await request.get('/api/users/' + userId);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(
        expect.objectContaining({ id: userId, ...createUser })
      );
    });

    it('should return updated object of user', async () => {
      const res = await request.put('/api/users/' + userId).send(updateUser);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(
        expect.objectContaining({ id: userId, ...updateUser })
      );
    });

    it('should delete object of user by id and return 204', async () => {
      const res = await request.delete('/api/users/' + userId);
      expect(res.status).toEqual(204);
      expect(res.body).toEqual('');
    });

    it('should return 404 and msg user is not found', async () => {
      const res = await request.get('/api/users/' + userId);
      expect(res.status).toEqual(404);
      expect(res.body).toEqual({
        code: 404,
        message: 'User not found',
      });
    });
  });

  describe('Scenario N2 - Create two new users => Read all (2 users) => Create new users (3 users) => Delete second (2 users) => Read all (2 users) => POST bad data', function () {
    const userIds: string[] = [];

    it('should create two new users', async () => {
      for (let i = 0; i < 2; i++) {
        const createNewUser = createUser;
        createNewUser.hobbies.push(String(i));
        const res = await request.post('/api/users').send(createNewUser);
        expect(res.status).toEqual(201);
        expect(res.body).toEqual(
          expect.objectContaining({ id: expect.any(String), ...createNewUser })
        );
        userIds.push(res.body.id);
      }
    });

    it('should return array of two users', async () => {
      const res = await request.get('/api/users');
      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(2);
    });

    it('should return created object of user with id', async () => {
      const res = await request.post('/api/users').send(createUser);
      expect(res.status).toEqual(201);
      expect(res.body).toEqual(
        expect.objectContaining({ id: expect.any(String), ...createUser })
      );
      userIds.push(res.body.id);
    });

    it('should delete second user by id and return 204', async () => {
      const res = await request.delete('/api/users/' + userIds[1]);
      userIds.splice(1, 1);
      expect(res.status).toEqual(204);
      expect(res.body).toEqual('');
    });

    it('should return array of two users', async () => {
      const res = await request.get('/api/users');
      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(2);
      expect(res.body.users[1].hobbies).toEqual(['hackers', '0', '1']);
    });

    it('should return internal error msg', async () => {
      const res = await request.post('/api/users').send(badUser);
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        code: 400,
        message: 'Body does not contain required fields (username, age, hobbies) or properties do not match data types',
      });
    });
  });

  describe('Scenario N3 - Create New users => Get data from non-existent url => Check not support method => Check invalid userID => Check user in DB', function () {
    let userId: string;
    let userForCheck: User;

    it('should create new user', async () => {
      const res = await request.post('/api/users').send(createUser);
      expect(res.status).toEqual(201);
      expect(res.body).toEqual(
        expect.objectContaining({ id: expect.any(String), ...createUser })
      );
      userId = res.body.id;
      userForCheck = res.body;
      console.log(userForCheck)
    });

    it('should return error msg "Route not found"', async () => {
      const res = await request.post('/nonExistentUrl').send(badUserJSON);
      expect(res.status).toEqual(404);
      expect(res.body).toEqual({
        code: 404,
        message: 'Route not found',
      });
    });

    it('should return error msg about not support method', async () => {
      const res = await request.patch('/api/users').send(badUserJSON);
      expect(res.status).toEqual(501);
      expect(res.body).toEqual({
        code: 501,
        message: 'Server does not support entered request with such request method',
      });
    });

    it('should return error msg "User id is invalid"', async () => {
      const res = await request.get('/api/users/' + userId + 'char');
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        code: 400,
        message: 'User id is invalid',
      });
    });

    it('should return error msg "User not found"', async () => {
      const badUserId = userId.substring(userId.length - 1) === 'a' ? userId.substring(0, userId.length - 1) + 'b' : userId.substring(0, userId.length - 1) + 'a'
      const res = await request.get('/api/users/' + badUserId);
      expect(res.status).toEqual(404);
      expect(res.body).toEqual({
        code: 404,
        message: 'User not found',
      });
    });

    it('should return user without changes', async () => {
      const res = await request.get('/api/users');
      expect(res.status).toEqual(200);
      console.log(userForCheck)
      console.log(res.body)
      expect(res.body.users.find((item: User) => userForCheck.id === item.id)).toEqual(userForCheck);
    });

  });
});