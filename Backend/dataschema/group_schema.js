import Joi from 'joi';
import { invitedUserSchema } from './user_schema';


export const groupschema = Joi.object().keys(
    {
        creator: Joi.string().email().required().label('creator'), 
        name: Joi.string().min(3).max(50).required().label('name'),
        members: Joi.array().items(invitedUserSchema).min(2).label('members')
    }
);