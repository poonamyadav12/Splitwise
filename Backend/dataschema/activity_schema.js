import Joi from 'joi';

export const ActivityType = Object.freeze({
    GROUP_CREATION: "GROUP_CREATION",
    TRANSACTION_ADDED: "TRANSACTION_ADDED",
    TRANSACTION_DELETED: "TRANSACTION_DELETED",
    MEMBER_ADDED: "MEMBER_ADDED",
    MEMBER_DELETED: "MEMBER_DELETED",

});

export const activitySchema = Joi.object().keys(
    {
        user_id: Joi.string().email().required(),
        group_id: Joi.string().required(),
        type: Joi.string().valid(ActivityType.values()).required(),
    }
);

const groupCreationSchema = Joi.object().keys(
    {
        group_id: Joi.string().required(),
        name: Joi.string().required(),
    }
);

const tnxAddedSchema = Joi.object().keys(
    {
        group_id: Joi.string().required(),

    }
)