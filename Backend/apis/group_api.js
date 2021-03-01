import { connection, getConnection, getPool } from '../database/mysql.js';
import { ActivityType } from '../dataschema/activity_schema.js';
import { groupschema } from '../dataschema/group_schema.js';
import { insertActivity } from './activity_api.js';
import { getTransactionsByGroupId } from './transactions_api.js';
import { insertIfNotExist, getUserById } from './user_api.js';
var Joi = require('joi');

export async function createGroup(req, res) {

    console.log("Inside create group post Request");
    const { error, value } = Joi.object().keys(
        { group: groupschema.required(), }
    ).validate(req.body);

    if (error) {
        res.send(error.details);
        return;
    }

    const group = value.group;
    console.log(JSON.stringify(group));
    const stmt = 'INSERT INTO GroupInfos(GroupInfo) VALUES (?)';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        modifiedGroup.members = group.members.map((member) => member.email);
        await conn.query(stmt, [JSON.stringify(modifiedGroup)]);
        await Promise.all(group.members.map((member) =>
            insertIfNotExist(conn, member)));
        await insertActivity(conn, buildGroupCreatedActivity(group.creator, group));
        await Promise.all(group.members.map((member) => insertActivity(conn, buildMemberAddedActivity(group.creator, group, member))));

        await conn.commit();

        res.status(200).send(group).end();
    } catch (err) {
        await conn.rollback();
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

export async function getGroupDetails(req, res) {

    // Access the provided 'page' and 'limt' query parameters
    let groupId = req.query.groupId;
    if (!groupId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid Group ID'
                }
            )
            .end();
    }

    console.log("Inside get group details Request");

    let conn;
    try {
        conn = await connection();
        const group = JSON.parse(await getGroupById(conn, groupId));
        const members = await Promise.all(group.members.map((member) => getUserById(conn, member)));
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        modifiedGroup.members = members.map((m) => JSON.parse(m));
        res.status(200).send(modifiedGroup).end();
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

export async function getAllGroupsForUser(req, res) {

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

    console.log("Inside get all group details Request");

    let conn;
    try {
        conn = await connection();
        const groups = await getGroupsByUserId(conn, userId);
        console.log("Groups " + JSON.stringify(groups));
        const modifiedGroups = await Promise.all(groups.map(async (group) => {
            const members = await Promise.all(group.members.map((member) => getUserById(conn, member)));
            const modifiedGroup = JSON.parse(JSON.stringify(group));
            modifiedGroup.members = members.map((m) => JSON.parse(m));
            console.log("modified " + JSON.stringify(modifiedGroup));
            const transactions = await getTransactionsByGroupId(conn, group.id);
            modifiedGroup.transactions = transactions;
            return modifiedGroup;
        }));
        console.log("Groups 2" + JSON.stringify(groups));

        res.status(200).send(modifiedGroups).end();
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

async function getGroupById(conn, groupId) {
    const stmt = 'SELECT GroupInfo FROM GroupInfos WHERE GroupId=?';
    const result = await conn.query(stmt, [groupId]);
    console.log("Inside geGroupById " + JSON.stringify(result));
    console.log(groupId);
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result))[0].GroupInfo;
    }
    return null;
}

async function getGroupsByUserId(conn, userId) {
    const stmt = 'SELECT GroupInfo FROM GroupInfos WHERE ? MEMBER OF (GroupInfo->>"$.members") ';
    const result = await conn.query(stmt, [userId]);
    console.log("Inside geGroupByUserIdId " + JSON.stringify(result));

    console.log(JSON.stringify(result));
    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => JSON.parse(value.GroupInfo));
    }
    return [];
}

function buildMemberAddedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        added: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_ADDED
    }));
}

function buildGroupCreatedActivity(creator, group) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        type: ActivityType.GROUP_CREATION
    }));
}