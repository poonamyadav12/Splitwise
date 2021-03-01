import { connection, getConnection, getPool } from '../database/mysql.js';
import { groupschema } from '../dataschema/group_schema.js';
import { txnschema } from '../dataschema/transaction_schema.js';
import { insertIfNotExist, getUserById } from './user_api.js';
import { v4 as uuidv4 } from 'uuid';
var Joi = require('joi');

export async function createTransaction(req, res) {

    console.log("Inside create txn post Request");
    const { error, value } = Joi.object().keys(
        { transaction: txnschema.required(), }
    ).validate(req.body);

    if (error) {
        res.send(error.details);
        return;
    }

    const transaction = value.transaction;
    console.log(JSON.stringify(transaction));
    const stmt = 'INSERT INTO Transactions (TransactionInfo) VALUES (?)';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const modifiedTxn = JSON.parse(JSON.stringify(transaction));
        modifiedTxn.id = uuidv4();
        await conn.query(stmt, [JSON.stringify(modifiedTxn)]);
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
        const transactions = await getTransactionsByGroupId(conn, groupId);
        console.log("Groups " + JSON.stringify(transactions));

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
    const stmt = 'SELECT TransactionInfo FROM Transactions WHERE JSON_EXTRACT(TransactionInfo, "$.group_id")=?';
    const result = await conn.query(stmt, [groupId]);
    console.log("Inside getTransactionsByGroupId " + JSON.stringify(result));

    console.log(JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => JSON.parse(value.TransactionInfo));
    }
    return [];
}
