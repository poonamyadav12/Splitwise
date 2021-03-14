import { connection } from '../database/mysql.js';
import { activitySchema } from '../dataschema/activity_schema.js';
import { v4 as uuidv4 } from 'uuid';
var Joi = require('joi');

export async function insertActivity(conn, activity) {

    console.log("Inside create Activity post Request");
    const { error, value } = activitySchema.validate(activity);

    if (error) {
        throw error;
    }

    console.log(JSON.stringify(activity));
    const stmt = 'INSERT INTO Activities(Activity) VALUES (?)';
    const modifiedActivity = JSON.parse(JSON.stringify(activity));
    modifiedActivity.id = uuidv4();
    await conn.query(stmt, [JSON.stringify(modifiedActivity)]);
    await conn.commit();
}

export async function getActivities(req, res) {
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

    let conn;
    try {
        conn = await connection();
        const activities = await getActivitiesByUserId(conn, userId);
        console.log("Activities By User ID " + JSON.stringify(activities));

        const sortedActivities = activities.slice().sort((a, b) => a.createdAt - b.createdAt)
        res.status(200).send(sortedActivities).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the Activities! Please check the application logs for more details.'
                }
            )
            .end();
    } finally {
        conn && conn.release();
    }
}

export async function getActivitiesByUserId(conn, userId) {

    const stmt = ' \
    SELECT \
    A.Activity, \
    ( \
        SELECT \
            U1.User \
        from \
            Users U1 \
        WHERE \
            U1.UserId = JSON_UNQUOTE(A.UserId) \
    ) AS Creator, \
    ( \
        SELECT \
            U2.User \
        from \
            Users U2 \
        WHERE \
            U2.UserId = JSON_EXTRACT(A.Activity,"$.added.email") \
    ) AS Added, \
    ( \
        SELECT \
            G1.GroupInfo \
        from \
            GroupInfos G1 \
        WHERE \
            G1.GroupId = A.GroupId \
    ) AS GroupInfo, \
    A.CreatedAt \
    FROM \
    Activities A \
    WHERE \
    A.GroupId IN ( \
        SELECT \
            G.GroupId \
        FROM \
            GroupInfos G \
        WHERE \
            ? MEMBER OF(JSON_EXTRACT(G.GroupInfo, "$.members")) \
    ) \
    ORDER BY \
    A.CreatedAt DESC;';

    const result = await conn.query(stmt, [userId]);
    console.log("Inside getActivitiesByUserId " + JSON.stringify(result));

    if (result.length > 0) {
        return JSON.parse(JSON.stringify(result)).map((value) => {
            const activity = JSON.parse(value.Activity);
            activity.creator = JSON.parse(value.Creator);
            if(value.Added) activity.added = JSON.parse(value.Added);
            activity.group = JSON.parse(value.GroupInfo);
            activity.createdAt = value.CreatedAt;
            return activity;
        });
    }

    return [];
}
