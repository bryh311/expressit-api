CREATE TABLE user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_website_admin BOOLEAN NOT NULL,
    internet_points INTEGER NOT NULL,
    CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE post (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    votes INTEGER NOT NULL,
    FOREIGN KEY(creator_id) REFERENCES user(user_id),
    FOREIGN KEY(group_id) REFERENCES subgroup(group_id)
);

CREATE TABLE subscription (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    is_moderator BOOLEAN NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(user_id),
    FOREIGN KEY(group_id) REFERENCES subgroup(group_id)
);

CREATE TABLE subgroup (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT
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