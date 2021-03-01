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
