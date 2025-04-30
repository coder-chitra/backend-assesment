CREATE TABLE users (
    username varchar(30) PRIMARY KEY ,
    email varchar(50) UNIQUE NOT NULL,
    password varchar(20) NOT NULL
);