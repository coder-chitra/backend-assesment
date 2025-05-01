# User Authentication Using (Node.js + PostgreSQL)

This project implements a basic user authentication system using Node.js and PostgreSQL.

## Features

- User registration with hashed passwords using **bcrypt**
- User login with password verification
- User login status tracking
- One-to-many relationship:
  - One user can have multiple login entries (user_login_details)

## Database Structure

### Table: `users`;

Stores user credentials and info. <br>

```
                Table "public.users"
  Column  |  Type   | Collation | Nullable | Default
----------+---------+-----------+----------+---------
 username | text    |           | not null |
 email    | text    |           | not null |
 password | text    |           | not null |
 pswcnt   | integer |           |          | 0
 isblock  | boolean |           |          | false
Indexes:
    "users_pkey" PRIMARY KEY, btree (username)
    "users_email_key" UNIQUE, btree (email)
    "users_username_key" UNIQUE, btree (username)
Referenced by:
    TABLE "users_login_details" CONSTRAINT "users_login_details_username_fkey" FOREIGN KEY (username) REFERENCES users(username)
```


### Table: `user_login_details`
```
                        Table "public.users_login_details"
      Column       |            Type             | Collation | Nullable | Default
-------------------+-----------------------------+-----------+----------+---------
 username          | character varying(30)       |           |          |
 user_login_time   | timestamp without time zone |           |          |
 user_login_status | boolean                     |           |          |
Foreign-key constraints:
    "users_login_details_username_fkey" FOREIGN KEY (username) REFERENCES users(username)

```


**Relationship:**  
- `users.username` → `user_login_details.username`  
- This models **one-to-many**: one user → many login records.

## Technologies Used

- Node.js
- Express
- PostgreSQL (`pg` module)
- bcrypt for password hashing

## How to Run

1. Clone the repo
2. Install dependencies: npm install 
3. Setup PostgreSQL tables (based on above structure) => (From schema.sql)
4. Run the app: nodemon index.js

## Routes

- `POST /register` - Register new user
- `POST /login` - Login existing user
- `GET /home/:user` - Home route

---