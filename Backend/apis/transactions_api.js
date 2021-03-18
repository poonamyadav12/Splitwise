import { connection, getConnection } from '../database/mysql.js';
import { groupschema } from '../dataschema/group_schema.js';
import { txnschema } from '../dataschema/transaction_schema.js';
import { insertIfNotExist, getUserById } from './user_api.js';
import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import { insertActivity } from './activity_api.js';
var Joi = require('joi');

export async function createTransaction(req, res) {
    console.log("Inside create txn post Request");
    const { error, value } = Joi.object().keys(
        { transaction: txnschema.required(), }
    ).validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    const transaction = value.transaction;
    const stmt = 'INSERT INTO Transactions (TransactionInfo) VALUES (?)';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const modifiedTxn = JSON.parse(JSON.stringify(transaction));
        modifiedTxn.id = uuidv4();
        await conn.query(stmt, [JSON.stringify(modifiedTxn)]);
        const transactionActivity = buiildTransactionActivity(modifiedTxn.from, modifiedTxn.group_id, modifiedTxn);
        insertActivity(conn, transactionActivity);
        await conn.commit();

        res.status(200).send(modifiedTxn).end();
    } catch (err) {
        await conn.rollback();
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully insert the txn! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function settleTransactions(req, res) {
    console.log("Inside settle txn post Request");
    const { error, value } = Joi.object().keys({
        transactions: Joi.array().items(txnschema)
    }).validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }

    const transactions = value.transactions;
    const stmt = 'INSERT INTO Transactions (TransactionInfo) VALUES (?)';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const modifiedTxns = transactions.map((txn) => {
            txn.id = uuidv4();
            return txn;
        });
        await Promise.all(modifiedTxns.map(async (txn) => await conn.query(stmt, [JSON.stringify(txn)])));
        modifiedTxns.map((modifiedTxn) => {
            const transactionActivity = buiildTransactionActivity(modifiedTxn.from, modifiedTxn.group_id, modifiedTxn);
            insertActivity(conn, transactionActivity);
        })
        await conn.commit();

        res.status(200).send(modifiedTxns).end();
    } catch (err) {
        await conn.rollback();
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully insert the txn! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

function buiildTransactionActivity(creator, groupId, transaction) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: groupId,
        },
        transaction: transaction,
        type: ActivityType.TRANSACTION_ADDED,
    }));
}

export async function getAllTransactionsForGroup(req, res) {

    // Access the provided 'page' and 'limt' query parameters
    let groupId = req.query.groupId;
    if (!groupId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid User ID'
                }
            )
            .end();
    }

    console.log("Inside get all group details Request");

    let conn;
    try {
        conn = await connection();
        const transactions = await getTransactionsByGroupIdV2(conn, groupId);

        res.status(200).send(transactions).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully insert the Group! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function getTransactionsByGroupId(conn, groupId) {
    const stmt = 'SELECT TransactionInfo, CreatedAt FROM Transactions WHERE JSON_EXTRACT(TransactionInfo, "$.group_id")=?';
    const result = await conn.query(stmt, [groupId]);
    console.log("Inside getTransactionsByGroupId " + JSON.stringify(result));

    console.log(JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => JSON.parse(value.TransactionInfo));
    }
    return [];
}

export async function getTransactionsByGroupIdV2(conn, groupId) {

    const stmt = '\
    SELECT \
        T.TransactionInfo, \
        ( \
            SELECT \
                U1.User \
            from \
                Users U1 \
            WHERE \
                U1.UserId=(T.TransactionInfo ->> "$.from") \
        ) AS FromUser, \
        ( \
            SELECT \
                JSON_ARRAYAGG(U2.User) \
            from \
                Users U2 \
            WHERE \
                U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to")) \
        ) AS ToUsers, \
        T.CreatedAt, \
        T.UpdatedAt \
    FROM \
        Transactions T \
    WHERE \
        JSON_EXTRACT(T.TransactionInfo, "$.group_id") = ? \
        ORDER BY T.CreatedAt DESC';

    const result = await conn.query(stmt, [groupId]);
    console.log("Inside getTransactionsByGroupId " + JSON.stringify(result));

    console.log(JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => {
            const transaction = JSON.parse(value.TransactionInfo);
            transaction.from = JSON.parse(value.FromUser);
            transaction.to = JSON.parse(value.ToUsers);
            transaction.createdAt = value.CreatedAt;
            return transaction;
        });
    }
    return [];
}

export async function getAllTransactionsForFriend(req, res) {

    // Access the provided 'page' and 'limt' query parameters
    let friendId = req.query.friendId;
    let userId = req.query.userId;
    if (!friendId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid friend ID'
                }
            )
            .end();
    }

    console.log("Inside get friend Transaction Request");

    let conn;
    try {
        conn = await connection();
        const transactions = await getTransactionsByFriendId(conn, friendId, userId);
        console.log("Transactions By friend ID  " + JSON.stringify(transactions));

        res.status(200).send(transactions).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the Friend Transaction! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}
export async function getAllTransactionsForUser(req, res) {

    // Access the provided 'page' and 'limt' query parameters
    let userId = req.query.userId;
    if (!userId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid User ID'
                }
            )
            .end();
    }

    console.log("Inside get User Transaction Request");

    let conn;
    try {
        conn = await connection();
        const transactions = await getTransactionsByUserId(conn, userId);
        console.log("Transactions By User ID  " + JSON.stringify(transactions));

        res.status(200).send(transactions).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the User Transaction! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}


export async function getTransactionsByFriendId(conn, friendId, userId) {
    const stmt = '    SELECT \
    T.TransactionInfo, \
    ( \
        SELECT \
            U1.User \
        from \
            Users U1 \
        WHERE \
            U1.UserId =(T.TransactionInfo ->> "$.from") \
    ) AS FromUser, \
    ( \
        SELECT \
            JSON_ARRAYAGG(U2.User) \
        from \
            Users U2 \
        WHERE \
            U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to")) \
    ) AS ToUsers, \
    T.CreatedAt, \
    T.UpdatedAt \
FROM \
    Transactions T \
WHERE \
    JSON_EXTRACT(T.TransactionInfo, "$.from") = ? AND ? MEMBER OF \
     (JSON_EXTRACT(T.TransactionInfo,"$.to")) OR (JSON_EXTRACT(T.TransactionInfo, "$.from") = ? AND ? MEMBER OF \
     (JSON_EXTRACT(T.TransactionInfo,"$.to"))) \
     ORDER BY T.CreatedAt DESC';

    const result = await conn.query(stmt, [userId, friendId, friendId, userId]);
    console.log("Inside getTransactionsByFriedId " + JSON.stringify(result));
    console.log(JSON.stringify(result));

    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => {
            const transaction = JSON.parse(value.TransactionInfo);
            transaction.from = JSON.parse(value.FromUser);
            transaction.to = JSON.parse(value.ToUsers);
            transaction.createdAt = value.CreatedAt;
            return transaction;
        });
    }

    return [];
}

async function getTransactionsByUserId(conn, userId) {

    const stmt = '    SELECT \
    T.TransactionInfo, \
    ( \
        SELECT \
            U1.User \
        from \
            Users U1 \
        WHERE \
            U1.UserId =(T.TransactionInfo ->> "$.from") \
    ) AS FromUser, \
    ( \
        SELECT \
            JSON_ARRAYAGG(U2.User) \
        from \
            Users U2 \
        WHERE \
            U2.UserId MEMBER OF(JSON_EXTRACT(T.TransactionInfo, "$.to")) \
    ) AS ToUsers, \
    ( \
        SELECT \
            G1.GroupInfo \
        from \
            GroupInfos G1 \
        WHERE \
            G1.GroupId = T.GroupId \
    ) AS GroupInfo, \
    T.CreatedAt, \
    T.UpdatedAt \
FROM \
    Transactions T \
WHERE \
    JSON_EXTRACT(T.TransactionInfo, "$.from") = ?  OR (? MEMBER OF \
     (JSON_EXTRACT(T.TransactionInfo,"$.to"))) \
     ORDER BY T.CreatedAt DESC';

    const result = await conn.query(stmt, [userId, userId, userId, userId]);
    console.log("Inside getTransactionsByUserId " + JSON.stringify(result));
    console.log(JSON.stringify(result));

    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => {
            const transaction = JSON.parse(value.TransactionInfo);
            transaction.from = JSON.parse(value.FromUser);
            transaction.to = JSON.parse(value.ToUsers);
            transaction.group = JSON.parse(value.GroupInfo);
            transaction.createdAt = value.CreatedAt;
            return transaction;
        });
    }

    return [];
}