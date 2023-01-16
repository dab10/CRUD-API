import 'dotenv/config';
import http from 'http';
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
  hobbies: ['hackers', 'programming'],
};
const badUser = { 
  username: 'Anonym', 
  age: 14, 
  hobbies: 'hackers' 
};
const PORT = Number(process.env.PORT) || 4000;

const server = startServer(PORT);
const request = supertest(server);

afterAll(() => {
  server.close();
});

describe('API Tests', function () {
  describe('Scenario N1 - Get all users => Create user => Get create user => update user => Delete updated => get deleted', function () {
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


});