import Joi from 'joi';

export const TransactionStatus = Object.freeze({
    ACTIVE: "ACTIVE",
    DELETED: "DELETED",
});

export const txnschema = Joi.object().keys(
    {
        from: Joi.string().email().required(),
        to: Joi.array().items(Joi.string().email()).min(1).required(),
        amount: Joi.number().required(),
        currency_code: Joi.string().max(3),
        group_id: Joi.string().required(),
        description: Joi.string().required(),
        status: Joi.string().default(TransactionStatus.ACTIVE),
    }
);