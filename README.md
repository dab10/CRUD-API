# Node.JS-RS-School-2022Q4 Task 3 - Simple CRUD API

This is simple CRUD API, which is using in-memory database underneath. 

Endpoint is `api/users`:
  * **GET** `api/users` or `api/users/${userId}` returns all users or user with corresponding `userId`
  * **POST** `api/users` is used to create record about new user and store it in database
  * **PUT** `api/users/${userId}` is used to update record about existing user
  * **DELETE** `api/users//${userId}` is used to delete record about existing user from database.

---

## How to install

To run this API server, you must do the following steps:

1. Clone this repository, for example:
    ```
    git clone https://github.com/dab10/CRUD-API.git
    ``` 
2. Switch branch to CRUD-API-DEV.
3. Run the command line and go to the created folder.
4. Install dependencies by entering the command
    ```
    npm install
    ``` 
5. Use commands:

    to run API server in development mode
    ```
    npm run start:dev
    ```

    or to build and run API server in production mode
    ```
    npm run start:prod
    ```
    or to build and run API server with load balancer in production mode
    ```
    npm run start:multi
    ```
    or to run API server with load balancer in development mode
    ```
    npm run dev:multi
    ```
---

## How to use

Send your requests to url 
```
http://localhost:4000/api/users
```
4000 is port by default, you can change it in .env file.

You can use Postman App or Thunder Client extension for VSCode to send request to the server. 

Body of POST and PUT object must have JSON body with:
  * `username` — user's name (`string`, **required**)
  * `age` — user's age (`number`, **required**)
  * `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

---

## Testing
You don't need to start server in additional terminal window. Just run test by command:

```
npm run test
```

---

## Application features
Database server is located on http:\\localhost:(PORT + 'number cpu your PC'). 
So, if there are errors on server side of this localhost, then you will get an error on any request from another server.

Please, when you make request, make the body size adequate.

---

## Contacts
Please, contact me if you have any questions.

discord: bazhenovda#5973

telegram: @dab1000