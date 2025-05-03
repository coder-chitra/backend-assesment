CREATE TABLE users (
    username varchar(30) PRIMARY KEY ,
    email varchar(50) UNIQUE NOT NULL,
    password varchar(20) NOT NULL,
    pswcnt integer DEFAULT 0,
    isblock boolean DEFAULT false,
);

CREATE TABLE users_login_details (
    username varchar(30) ,
    user_login_time timestamp ,
    user_login_status boolean,
    FOREIGN KEY (username) REFERENCES users(username)
);


