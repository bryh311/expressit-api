CREATE TABLE user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE post (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    votes INTEGER NOT NULL,
    FOREIGN KEY(creator_id) REFERENCES user(user_id)
);

CREATE TABLE comment (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    votes INTEGER NOT NULL,
    FOREIGN KEY(creator_id) REFERENCES user(user_id),
    FOREIGN KEY(post_id) REFERENCES post(post_id)
);