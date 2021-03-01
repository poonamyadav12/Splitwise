import Joi from 'joi';
import { invitedUserSchema } from './user_schema';


export const groupschema = Joi.object().keys(
    {
        creator: Joi.string().email().required(), 
        name: Joi.string().min(3).max(50).required(),
        id: Joi.string().id().required(),
        members: Joi.array().items(invitedUserSchema)
    }
);