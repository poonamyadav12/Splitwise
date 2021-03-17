import Joi from 'joi';
const passwordComplexity = require("joi-password-complexity");

export const RegistrationStatus = Object.freeze({
    INVITED: "INVITED",
    JOINED: "JOINED",
});

const userfields = {
    first_name: Joi.string().alphanum().min(3).max(50).required().label('First name'),
    last_name: Joi.string().alphanum().min(3).max(50).optional(),
    avatar: Joi.string().uri().required(),
    email: Joi.string().email().required().label('Email'),
    id: Joi.ref('email'),
    country_code: Joi.string().max(5),
    default_currency: Joi.string().min(3).max(3).required().label('Default currency'),
    password: passwordComplexity(undefined, "password").required().label('password'),
    registration_status: Joi.string().default(RegistrationStatus.JOINED),
    time_zone: Joi.string().required().label('Time zone'),
};

export const userschema = Joi.object().keys(
    userfields
);

export const updateuserschema = Joi.object().keys(
    {
        ...userfields,
        new_password: passwordComplexity(undefined, "new password").optional().label('new password'),
    }
);

export const invitedUserSchema = Joi.object().keys(
    {
        first_name: Joi.string().alphanum().min(3).max(50).required(),
        last_name: Joi.string().alphanum().min(3).max(50).optional(),
        picture: Joi.string().uri().optional(),
        email: Joi.string().email().required(),
        registration_status: Joi.string().default(RegistrationStatus.INVITED)
    }
);
