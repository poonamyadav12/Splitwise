import { connection, getConnection, getPool } from '../database/mysql.js';
import { groupschema } from '../dataschema/group_schema.js';
import { getTransactionsByGroupId } from './transactions_api.js';
import { insertIfNotExist, getUserById } from './user_api.js';
var Joi = require('joi');
