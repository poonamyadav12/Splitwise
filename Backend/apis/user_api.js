var Joi = require('joi');
//const { Sequelize } = require('sequelize');

const { DB_USERNAME, DB_PASSWORD, DB_NAME, CLOUD_SQL_CONNECTION_NAME } = require("../database/constants");
import { connection } from '../database/mysql.js';
import { ActivityType } from '../dataschema/activity_schema.js';
import { RegistrationStatus, userschema } from '../dataschema/user_schema.js';

export async function createUser(req, res) {
    console.log("Inside create user post Request");
    const { error, value } = Joi.object().keys(
        { user: userschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    const user = value.user;
    let conn;
    try {
        console.log("createUser: " + JSON.stringify(user));
        conn = await connection();
        const storedUser = await getUserById(conn, user.email);

        console.log("storedUser  " + storedUser);
        if (storedUser && isUserInvited(storedUser)) {
            await updateUser(conn, user);
        } else {
            await insertUser(conn, user);
        }

    } catch (err) {
        console.log(err);
        res.status(500)
            .send({
                code: err.code,
                msg: 'Unable to successfully insert the user! Please check the application logs for more details.',
            }
            ).end();
        return;
    } finally {
        conn && conn.release();
    }
    res.status(200).cookie('cookie', user.email, { maxAge: 900000, httpOnly: false, path: '/' }).send(user.email).end();
}

export async function validateLogin(req, res) {
    console.log("Inside Login Post Request");
    const { error, value } = Joi.object().keys(
        {
            id: Joi.string().required(),
            password: Joi.string().required(),
        }
    ).validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }

    console.log("validateLogin: " + JSON.stringify(value));
    const { id, password } = value;

    let conn;
    try {
        conn = await connection();

        const user = await getUserByIdAndPassword(conn, id, password);
        if (user) {
            res.status(200).cookie('cookie', id, { maxAge: 900000, httpOnly: false, path: '/' }).send(user).end();

            return;
        }
        res.status(400).send({ code: 'INVALID_LOGIN', msg: 'UserId and password does not exists.' }).end();
    } catch (err) {
        console.log(err);
        res.status(500).send({ code: err.code, msg: 'Unable to validate the credentials.' }).end();
        return;
    } finally {
        conn && conn.release();
    }
}

async function insertUser(conn, user) {
    const stmt = 'INSERT INTO Users(User) VALUES (?)';
    console.log("Inside insertUser " + JSON.stringify(user));
    await conn.query(stmt, [JSON.stringify(user)]);
}

async function updateUser(conn, user) {
    const stmt = 'UPDATE Users SET User=? WHERE UserId=?';
    console.log("Inside updateUser " + JSON.stringify(user));
    await conn.query(stmt, [JSON.stringify(user), user.email]);
}

export async function insertIfNotExist(conn, user) {
    const id = user.email;
    const storedUser = await getUserById(conn, id);
    if (storedUser) {
        return;
    }
    await insertUser(conn, user);
}

export async function getUserById(conn, userId) {
    const stmt = 'SELECT User FROM Users WHERE UserId=?';
    const result = await conn.query(stmt, [userId]);
    console.log("Inside geUserById " + JSON.stringify(result));
    console.log(userId);
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result))[0].User;
    }
    return null;
}

async function getUserByIdAndPassword(conn, userId, password) {
    console.log("UserId " + userId + " password " + password)
    const stmt = 'SELECT User FROM Users WHERE UserId=? AND  JSON_EXTRACT(User, "$.password")=?';
    const result = await conn.query(stmt, [userId, password]);
    console.log("Result of login " + JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result))[0].User;
    }
    return null;
}

function isUserInvited(user) {
    console.log("isUserInvited: " + JSON.parse(user).registration_status);
    return (JSON.parse(user).registration_status === RegistrationStatus.INVITED);
}
