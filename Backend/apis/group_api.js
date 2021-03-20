import { v4 as uuidv4 } from 'uuid';
import { connection } from '../database/mysql.js';
import { ActivityType } from '../dataschema/activity_schema.js';
import { creategroupschema, updategroupschema } from '../dataschema/group_schema.js';
import { GroupJoinStatus } from '../dataschema/user_schema.js';
import { insertActivity } from './activity_api.js';
import { getTransactionsByGroupId } from './transactions_api.js';
import { getUserById, insertIfNotExist } from './user_api.js';
var Joi = require('joi');
var _ = require('lodash');

export async function createGroup(req, res) {
    console.log("Inside create group post Request");
    const { error, value } = Joi.object().keys(
        { group: creategroupschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    return createOrUpdateGroup(value, res, false);
}

export async function updateGroup(req, res) {
    console.log("Inside create group post Request");
    const { error, value } = Joi.object().keys(
        { group: updategroupschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    return createOrUpdateGroup(value, res, true);
}

async function createOrUpdateGroup(value, res, isUpdate) {
    const group = value.group;
    const stmt = isUpdate ? 'UPDATE GroupInfos SET GroupInfo=? WHERE GroupId=?' : 'INSERT INTO GroupInfos(GroupInfo) VALUES (?)';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        if (!isUpdate) {
            modifiedGroup.id = uuidv4();
            group.id = modifiedGroup.id;
        }

        modifiedGroup.members = group.members.map((member) => member.email);
        modifiedGroup.group_join_status = group.members.map((member) => member.group_join_status || GroupJoinStatus.JOINED);
        await conn.query(stmt, isUpdate ? [JSON.stringify(modifiedGroup), group.id] : [JSON.stringify(modifiedGroup)]);
        await Promise.all(group.members.map((member) =>
            insertIfNotExist(conn, member)));
        if (isUpdate) {
            const storedGroup = JSON.parse(await getGroupById(conn, group.id));
            const newMembers = _.difference(group.to, storedGroup.to);
            await Promise.all(newMembers.filter((member) => member.email != storedGroup.creator).map((member) => insertActivity(conn, buildMemberAddedActivity(group.creator, group, member))));
        } else {
            await Promise.all(group.members.filter((member) => member.email != group.creator).map((member) => insertActivity(conn, buildMemberAddedActivity(group.creator, group, member))));
        }

        if (!isUpdate) {
            await insertActivity(conn, buildGroupCreatedActivity(group.creator, group));
        }

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
                    msg: 'Unable to successfully insert/update the Group! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function leaveGroup(req, res) {
    console.log("Inside leave group post Request");
    const { error, value } = Joi.object().keys(
        {
            groupId: Joi.string().required(),
            userId: Joi.string().required()
        }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    const { groupId, userId } = value;
    const stmt = 'UPDATE GroupInfos SET GroupInfo=? WHERE GroupId=?';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const storedGroup = JSON.parse(await getGroupById(conn, groupId));
        const newMembersWithJoinStatus = _.remove(_.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => ({ member, group_join_status })
        ), (mg) => mg.member != userId);
        storedGroup.members = newMembersWithJoinStatus.map((mg) => mg.member);
        storedGroup.group_join_status = newMembersWithJoinStatus.map((mg) => mg.group_join_status);
        await conn.query(stmt, [JSON.stringify(storedGroup), storedGroup.id]);
        const user = JSON.parse(await getUserById(conn, userId));
        await insertActivity(conn, buildMemberDeletedActivity(user.email, storedGroup, user));
        await conn.commit();

        res.status(200).send(storedGroup).end();
    } catch (err) {
        await conn.rollback();
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully insert/update the Group! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function joinGroup(req, res) {
    console.log("Inside join group post Request");
    const { error, value } = Joi.object().keys(
        {
            groupId: Joi.string().required(),
            userId: Joi.string().required()
        }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }

    const { groupId, userId } = value;
    const stmt = 'UPDATE GroupInfos SET GroupInfo=? WHERE GroupId=?';
    let conn;
    try {
        conn = await connection();
        await conn.beginTransaction();
        const storedGroup = JSON.parse(await getGroupById(conn, groupId));
        const members_with_join_status = _.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => {
                if (member === userId) {
                    return { member, group_join_status: 'JOINED' };
                }
                return { member, group_join_status };
            }
        );

        storedGroup.members = members_with_join_status.map((m) => m.member);
        storedGroup.group_join_status = members_with_join_status.map((m) => m.group_join_status);
        console.log("storedGroupRRR ", JSON.stringify(storedGroup));
        await conn.query(stmt, [JSON.stringify(storedGroup), storedGroup.id]);
        const user = JSON.parse(await getUserById(conn, userId));
        await insertActivity(conn, buildMemberJoinedActivity(user.email, storedGroup, user));
        await conn.commit();

        res.status(200).send(storedGroup).end();
    } catch (err) {
        await conn.rollback();
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully join the Group! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function getGroupDetails(req, res) {
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
        const members = await Promise.all(
            group.members.map((member) => getUserById(conn, member))
        );
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        modifiedGroup.members = _.zipWith(
            members,
            group.group_join_status,
            (m, g) => ({ ...JSON.parse(m), group_join_status: g })
        );
        res.status(200).send(modifiedGroup).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully get the Group! Please check the application logs for more details.',
            })
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
        const modifiedGroups = await Promise.all(groups.map(async (group) => {
            const members = await Promise.all(group.members.map((member) => getUserById(conn, member)));
            const modifiedGroup = JSON.parse(JSON.stringify(group));
            console.log("GG Group", group);
            modifiedGroup.members = _.zipWith(
                members,
                group.group_join_status,
                (m, g) => ({ ...JSON.parse(m), group_join_status: g })
            );
            console.log("Modified Group", modifiedGroup);
            const transactions = await getTransactionsByGroupId(conn, group.id);
            modifiedGroup.transactions = transactions;
            return modifiedGroup;
        }));

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

function buildMemberDeletedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        deleted: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_DELETED
    }));
}

function buildMemberJoinedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        joined: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_JOINED
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
