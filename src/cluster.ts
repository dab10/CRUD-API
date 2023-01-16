import * as http from "http";
import cluster from 'cluster';
import { startServer } from './server';
import { getUserData } from "./utils/getUserData";
import { apiUrl, baseUrl, HttpStatusCode, usersUrl, ValidateBodyRequestStatus } from "./utils/const";
import * as model from "./models/model";
import { validateBodyRequest } from "./utils/validateBodyRequest";

const PORT = Number(process.env.PORT) || 4000;
const masterPort = Number(process.env.PORT) || 4000;
const serverPorts: number[] = [];
let isFirstRequest = true;
let isFirstStart = true;
let current = 0;

// const cpusCount = os.cpus().length;
const cpusCount = 4;
const port1 = PORT
const serverDBPort = port1 + cpusCount;

if (cluster.isPrimary) {

  console.log(`CPUs: ${cpusCount}`);
  console.log(`Master started. Pid: ${process.pid}`);
  // masterServer = startServer();

  for (let i = 1; i <= cpusCount; i++) {
    const newPort = PORT + i;
    cluster.fork({ PORT: newPort });
    // servers.push(`http://localhost:${newPort}`)
    serverPorts.push(newPort)
  }

  // if (isFirstStart) {
  //   isFirstStart = false;
  //   console.log('ServerPrimary= ', serverDBPort)
  //   const serverDB = startServer(serverDBPort);
  //   console.log(`ServerDB started. Pid: ${process.pid}`);
  // }

  const masterServer = http.createServer(async (req, responseMasterServer) => {
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
        // console.log(database.users)
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
        console.log(body)

        if (body) {
          const { code } = JSON.parse(body);
          responseMasterServer.writeHead(code, { 'Content-Type': 'application/json' });
          responseMasterServer.end(body);
        }

        responseMasterServer.writeHead(HttpStatusCode.NoContent, { 'Content-Type': 'application/json' });
        responseMasterServer.end(body);
      });
      requestToWorkerServer.write(data);
      requestToWorkerServer.end();
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
      isFirstStart = false;
      console.log('ServerPrimary= ', port1 + cpusCount - cluster.worker.id)
      startServer(port1 + cpusCount - cluster.worker.id);
      console.log(`ServerDB started. Pid: ${process.pid}`);

  } else {
  // const workerServer = startServer();
  console.log("!!!!!!!", cluster.worker?.id)
  const workerServer = http.createServer(async (req, responseWorkerServer) => {

    if (cluster.worker)

    if (req.url === baseUrl && req.method === 'GET') {

      const options = {
        port: port1 + cpusCount - cluster.worker.id,
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
      // responseWorkerServer.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
      // responseWorkerServer.end(JSON.stringify(database));

    } else if (req.url === baseUrl && req.method === 'POST') {
      
      const data = await getUserData(req);

      const options = {
        port: port1 + cpusCount - cluster.worker.id,
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
        // console.log(JSON.parse(body))
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
        // console.log(database.users)
      })

      requestToWorkerServer.write(data);
      requestToWorkerServer.end();
    } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'GET') {
      const id = req.url.split('/')[3];
      const options = {
        port: port1 + cpusCount - cluster.worker.id,
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
        port: port1 + cpusCount - cluster.worker.id,
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
        // await updateUser(req, responseMasterServer, id);
      

  } else if (req.url && req.url.split('/').length === 4 && req.url.split('/')[1] === apiUrl && req.url.split('/')[2] === usersUrl && req.method === 'DELETE') {
    const id = req.url.split('/')[3];
    const data = await getUserData(req);

    const options = {
      port: port1 + cpusCount - cluster.worker.id,
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
      }

      responseWorkerServer.writeHead(HttpStatusCode.NoContent, { 'Content-Type': 'application/json' });
      responseWorkerServer.end(body);
    });
    requestToWorkerServer.write(data);
    requestToWorkerServer.end();
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

// 'use strict';
// let current = 0;
  



// import os from 'node:os';
// import net from 'node:net';
// import http from 'node:http';
// import process from 'node:process';
// import cluster, { Worker } from 'node:cluster';
// import EventEmitter from 'node:events';
// import { startServer } from './server';
// import { UserDB } from "./userDB/userDB";
// import { getUserData } from './utils/getUserData';

// const cpus = os.cpus().length;
// const PORT = Number(process.env.PORT) || 4000;
// const database: UserDB = {
//   users: []
// };
// const workers: Worker[] = [];
// if (cluster.isPrimary) {

//   console.log(`Master pid: ${process.pid}`);
//   console.log(`Starting ${cpus} forks`);




//   for (let i = 0; i < cpus; i++) {
//     const newPort = PORT + i;
//     const worker = cluster.fork({ PORT: newPort });
//     workers.push(worker);
//   }

//   const ipToInt = (ip: string) => ip.split('.')
//     .reduce((res: number, item: string) => (res << 8) + (+item), 0);

//   const balancer = (socket: net.Socket) => {
//     const ip = ipToInt(socket.remoteAddress as string);
//     const id = Math.abs(ip) % cpus;
//     const worker = workers[id];
//     if (worker) worker.send({ name: 'socket' }, socket);
//   };

//   const server = new net.Server(handler);
//   server.listen(PORT);

// } else {

//   console.log(`Worker pid: ${process.pid}`);

//   const dispatcher = (req: http.IncomingMessage, res: http.ServerResponse) => {
//     console.log(req.url);
//     res.setHeader('Process-Id', process.pid);
//     res.end(`Hello from worker ${process.pid}`);
//   };

//   const server = startServer();
//   server.listen(null);

//   process.on('message', (message: any, socket: any) => {
//     if (message.name === 'socket') {
//       socket.server = server;
//       server.emit('connection', socket);
//     }
//   });

// }

// const handler = async (req: http.IncomingMessage, res: http.ServerResponse) =>{
//   const body = await getUserData(req);
//   const {method, url, headers} = req;
//   const server = workers[current];
//   current === (workers.length-1)? current = 0 : current++

//   try{
//       const response = await fetch(`${server}${url}`, {
//           method: method,
//           headers: headers as HeadersInit,
//           body: body
//       });
// console.log(response)
//   }
//   catch(err){
//       console.log("Server error!!!!!!!!!!!!!")    
//   }
// }
}