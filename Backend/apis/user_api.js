var Joi = require('joi');
import { connection } from '../database/mysql.js';
import { SignupStatus, updateuserschema, userschema } from '../dataschema/user_schema.js';
const bcrypt = require('bcrypt');

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
    console.log("User Creation ", JSON.stringify(user));
    let conn;
    try {
        conn = await connection();
        const storedUser = await getUserById(conn, user.email);

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
    res.status(200).cookie('cookie', user.email, { maxAge: 900000, httpOnly: false, path: '/' }).send(user).end();
}

export async function updateExistingUser(req, res) {
    console.log("Inside update user post Request", JSON.stringify(req.body));
    const { error, value } = Joi.object().keys(
        { user: updateuserschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    const user = value.user;
    let conn;
    try {
        conn = await connection();
        const storedUser = JSON.parse(await getUserById(conn, user.email));

        if (!storedUser) {
            res.status(500)
                .send({
                    code: 'INVALID_USER_ID',
                    msg: 'Invalid user ID.',
                }
                ).end();
            return;
        }

        console.log("current user  " + JSON.stringify(user));

        if (user.new_password) {
            const passwordMatch = await matchPassword(user.password, storedUser.password);
            if (!passwordMatch) {
                res.status(500)
                    .send({
                        code: 'INVALID_PASSWORD',
                        msg: 'Invalid password.',
                    }
                    ).end();
                return;
            }
            user.password = await hashPassword(user.new_password);
            delete user.new_password;
        } else {
            if (storedUser.password !== user.password) {
                res.status(500)
                    .send({
                        code: 'INVALID_PASSWORD',
                        msg: 'Invalid password.',
                    }
                    ).end();
                return;
            }
        }

        await updateUser(conn, user);
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
    res.status(200).cookie('cookie', user.email, { maxAge: 900000, httpOnly: false, path: '/' }).send(user).end();
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

        const user = JSON.parse(await getUserById(conn, id));
        const passwordMatch = await matchPassword(password, user.password);
        if (!passwordMatch) {
            res.status(500)
                .send({
                    code: 'INVALID_PASSWORD',
                    msg: 'Invalid password.',
                }
                ).end();
            return;
        }
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
    user.password = await hashPassword(user.password);
    console.log("Inside insertUser " + JSON.stringify(user));
    await conn.query(stmt, [JSON.stringify(user)]);
}

async function updateUser(conn, user) {
    const stmt = 'UPDATE Users SET User=? WHERE UserId=?';
    console.log("Inside updateUser " + JSON.stringify(user));
    await conn.query(stmt, [JSON.stringify(user), user.email]);
}

export async function insertIfNotExist(conn, user) {
    console.log("User id " + JSON.stringify(user));
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
    const stmt = 'SELECT User FROM Users WHERE UserId=? AND  JSON_EXTRACT(User, "$.password")=?';
    const result = await conn.query(stmt, [userId, password]);
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result))[0].User;
    }
    return null;
}

function isUserInvited(user) {
    console.log("isUserInvited: " + JSON.parse(user).registration_status);
    return (JSON.parse(user).registration_status === SignupStatus.INVITED);
}

export async function getUsersBySearchString(req, res) {
    let searchString = req.query.queryString;
    console.log("Search String " + searchString);
    let limit = req.query.limit;
    let conn = null;
    try {
        conn = await connection();
        const users = await searchUsers(conn, searchString, limit);
        res.status(200).send(users).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the search result! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

async function searchUsers(conn, searchString = "", limit = 20) {
    console.log("string " + searchString);
    const stmt = '\
    SELECT\
        User\
    from\
        Users\
    WHERE\
        SOUNDEX(?) LIKE SOUNDEX((User ->> "$.first_name")) OR \
        SOUNDEX(?) LIKE SOUNDEX((User ->> "$.last_name")) \
        LIMIT ? ';
    const result = await conn.query(stmt, [searchString, searchString, limit]);
    console.log(JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => JSON.parse(value.User));
    }
    return [];
}

async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
    return hashedPassword
}

export async function matchPassword(newPassword, storedEncryptedPassword) { // updated
    console.log("Inside match password");
    console.log("passw1" + newPassword + " password2 " + storedEncryptedPassword);
    const isSame = await bcrypt.compare(newPassword, storedEncryptedPassword) // updated
    console.log(isSame) // updated
    return isSame;

}