import { connection } from '../database/mysql.js';
var Joi = require('joi');

export async function createActivity(conn, activity) {

    console.log("Inside create Activity post Request");
    const { error, value } = Joi.object().keys(
        { activity: activitySchema.required(), }
    ).validate(activity);

    if (error) {
        throw error;
    }

    console.log(JSON.stringify(activity));
    const stmt = 'INSERT INTO Activities (Activity) VALUES (?)';
    const modifiedActivity = JSON.parse(JSON.stringify(value.activity));
    modifiedActivity.id = uuidv4();
    await conn.query(stmt, [JSON.stringify(modifiedActivity)]);
    await conn.commit();
}
