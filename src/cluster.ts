import * as http from "http";
import os from "os";
import cluster from 'cluster';
import { startServer } from './server';
import { getUserData } from "./utils/getUserData";
import { apiUrl, baseUrl, Errors, HttpStatusCode, usersUrl, ValidateBodyRequestStatus } from "./utils/const";
import * as model from "./models/model";
import { validateBodyRequest } from "./utils/validateBodyRequest";

const PORT = Number(process.env.PORT) || 4000;
const serverPorts: number[] = [];
let isFirstRequest = true;
let current = 0;

// const cpusCount = os.cpus().length;
const cpusCount = 4;

if (cluster.isPrimary) {

  console.log(`CPUs: ${cpusCount}`);
  console.log(`Master started. Pid: ${process.pid}`);

  for (let i = 1; i <= cpusCount; i++) {
    const newPort = PORT + i;
    cluster.fork({ PORT: newPort });
    serverPorts.push(newPort)
  }

  const masterServer = http.createServer(async (req, responseMasterServer) => {
    try {
      if (isFirstRequest) {
        isFirstRequest = false;
        current = 0;
      } else {
        current === (serverPorts.length-1) ? current = 0 : current++;
      }
      console.log(current)
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",req.headers.host)
  
      if (req.url === baseUrl && req.method === 'GET') {
        const options = {
          port: serverPorts[current],
          path: '/api/users',
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
        };
        const requestToWorkerServer = http.request(options, async (res) => {
          const body = await getUserData(res);
  
          responseMasterServer.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
          responseMasterServer.end(body);
        });
        requestToWorkerServer.end();
      } else if (req.url === baseUrl && req.method === 'POST') {
        const data = await getUserData(req);
  
        const options = {
          port: serverPorts[current],
          path: '/api/users',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length
          }
        };
      
        const requestToWorkerServer = http.request(options, async (res) => {
          const body = await getUserData(res);
  
          const { code } = JSON.parse(body);
  
          responseMasterServer.writeHead(code? code : HttpStatusCode.Created, { 'Content-Type': 'application/json' })
          responseMasterServer.end(body);
        })
  
        requestToWorkerServer.write(data);
        requestToWorkerServer.end();
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'GET') {
        const id = req.url.split('/')[3];
  
        const options = {
          port: serverPorts[current],
          path: `/api/users/${id}`,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
        };

        const requestToWorkerServer = http.request(options, async (res) => {
          const body = await getUserData(res);
  
          const { code } = JSON.parse(body);
  
          responseMasterServer.writeHead(code? code : HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
          responseMasterServer.end(body);
        });
        requestToWorkerServer.end();
  
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'PUT') {
          const id = req.url.split('/')[3];
          const data = await getUserData(req);
  
          const options = {
            port: serverPorts[current],
            path: `/api/users/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
          };
  
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
            console.log(body)
            const { code } = JSON.parse(body);
    
            responseMasterServer.writeHead(code? code : HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
            responseMasterServer.end(body);
          });
          requestToWorkerServer.write(data);
          requestToWorkerServer.end();
          
      } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'DELETE') {
        const id = req.url.split('/')[3];
        const data = await getUserData(req);
  
        const options = {
          port: serverPorts[current],
          path: `/api/users/${id}`,
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length
          }
        };
  
        const requestToWorkerServer = http.request(options, async (res) => {
          const body = await getUserData(res);
          console.log("DELETE= ", body)
  
          if (body) {
            const { code } = JSON.parse(body);
            responseMasterServer.writeHead(code, { 'Content-Type': 'application/json' });
            responseMasterServer.end(body);
          } else {
            responseMasterServer.writeHead(HttpStatusCode.NoContent, { 'Content-Type': 'application/json' });
            responseMasterServer.end(body);
          }
        });
        requestToWorkerServer.write(data);
        requestToWorkerServer.end();
      } else if (
        (req.url === baseUrl && req.method !== 'GET') || 
        (req.url === baseUrl && req.method !== 'POST') ||
        (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && !['GET', 'PUT', 'DELETE'].some((item) => item === req.method))
      ) {
        responseMasterServer.writeHead(HttpStatusCode.NotImplemented, { 'Content-Type': 'application/json' });
        responseMasterServer.end(JSON.stringify({ code: HttpStatusCode.NotImplemented, message: Errors.MethodNotSupport}));
      } else {
        responseMasterServer.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
        responseMasterServer.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.RouteNotFound}));
      }
    } catch {
      responseMasterServer.writeHead(HttpStatusCode.InternalServerError, { 'Content-Type': 'application/json' });
      responseMasterServer.end(JSON.stringify({ code: HttpStatusCode.InternalServerError, message: Errors.ServerError}));
    }
  });

  masterServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGINT', () => {
    console.log(`Server stopping on port ${PORT}first`);
    masterServer.close(() => {
      process.exit();
    })
    process.exit();
  }) 

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else if (cluster.isWorker) {
  if (cluster.worker && cluster.worker.id === cpusCount) {
    console.log("!!!!!!!", cluster.worker?.id)  
    startServer(PORT + cpusCount - cluster.worker.id);
    console.log(`ServerDB started. Pid: ${process.pid}`);
  } else {
    console.log("!!!!!!!", cluster.worker?.id)
    const workerServer = http.createServer(async (req, responseWorkerServer) => {
      try {
        if (cluster.worker)

        if (req.url === baseUrl && req.method === 'GET') {
  
          const options = {
            port: PORT + cpusCount - cluster.worker.id,
            path: '/api/users',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
          };
  
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
  
            responseWorkerServer.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
            responseWorkerServer.end(body);
          });
          requestToWorkerServer.end();
  
        } else if (req.url === baseUrl && req.method === 'POST') {
          
          const data = await getUserData(req);
  
          const options = {
            port: PORT + cpusCount - cluster.worker.id,
            path: '/api/users',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
          };
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",req.headers.host)
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
  
            if (validateBodyRequest(body, true) === ValidateBodyRequestStatus.Ok) {
              const { id, username, age, hobbies } = JSON.parse(body);
  
              const user = { 
                id,
                username,
                age,
                hobbies 
              };
  
              await model.create(user, true);
            }
            const { code } = JSON.parse(body);
  
            responseWorkerServer.writeHead(code? code : HttpStatusCode.Created, { 'Content-Type': 'application/json' })
            responseWorkerServer.end(body);
          })
  
          requestToWorkerServer.write(data);
          requestToWorkerServer.end();
        } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'GET') {
          const id = req.url.split('/')[3];
          const options = {
            port: PORT + cpusCount - cluster.worker.id,
            path: `/api/users/${id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
          };
  
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
  
            const { code } = JSON.parse(body);
  
            responseWorkerServer.writeHead(code? code : HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
            responseWorkerServer.end(body);
          });
          requestToWorkerServer.end();
  
        } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'PUT') {
  
          const id = req.url.split('/')[3];
          const data = await getUserData(req);
  
          const options = {
            port: PORT + cpusCount - cluster.worker.id,
            path: `/api/users/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
          };
  
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
            console.log(body)
            const { code } = JSON.parse(body);
  
            responseWorkerServer.writeHead(code? code : HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
            responseWorkerServer.end(body);
          });
          requestToWorkerServer.write(data);
          requestToWorkerServer.end();
  
        } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'DELETE') {
          const id = req.url.split('/')[3];
          const data = await getUserData(req);
  
          const options = {
            port: PORT + cpusCount - cluster.worker.id,
            path: `/api/users/${id}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
          };
  
          const requestToWorkerServer = http.request(options, async (res) => {
            const body = await getUserData(res);
            console.log(body)
            if (body) {
              const { code } = JSON.parse(body);
              responseWorkerServer.writeHead(code, { 'Content-Type': 'application/json' });
              responseWorkerServer.end(body);
            } else {
              responseWorkerServer.writeHead(HttpStatusCode.NoContent, { 'Content-Type': 'application/json' });
              responseWorkerServer.end(body);
            }
          });
          requestToWorkerServer.write(data);
          requestToWorkerServer.end();
        } else if (
          (req.url === baseUrl && req.method !== 'GET') || 
          (req.url === baseUrl && req.method !== 'POST') ||
          (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && !['GET', 'PUT', 'DELETE'].some((item) => item === req.method))
        ) {
          responseWorkerServer.writeHead(HttpStatusCode.NotImplemented, { 'Content-Type': 'application/json' });
          responseWorkerServer.end(JSON.stringify({ code: HttpStatusCode.NotImplemented, message: Errors.MethodNotSupport}));
        } else {
          responseWorkerServer.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'application/json' });
          responseWorkerServer.end(JSON.stringify({ code: HttpStatusCode.NotFound, message: Errors.RouteNotFound}));
        }
      } catch {
        responseWorkerServer.writeHead(HttpStatusCode.InternalServerError, { 'Content-Type': 'application/json' });
        responseWorkerServer.end(JSON.stringify({ code: HttpStatusCode.InternalServerError, message: Errors.ServerError}));
      }
    })

    workerServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    process.on('SIGINT', () => {
      console.log(`Server stopping on port ${PORT}second`);
      workerServer.close(() => {
        process.exit(0);
      })
    }) 
    console.log(`Worker ${process.pid} started`);
  }
}