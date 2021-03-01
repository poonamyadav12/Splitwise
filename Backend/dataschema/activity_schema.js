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
        from: Joi.string().email().required(),
        to: Joi.array().items(Joi.string().email()).min(1).required(),
        amount: Joi.number().required(),
        currency_code: Joi.string().max(3),
        group_id: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.string().valid(ActivityType.values()).required(),
    }
);