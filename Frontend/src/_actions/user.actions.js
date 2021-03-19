import { SERVER_URL, userConstants } from '../_constants';
import { alertActions } from './';
import axios from 'axios';
import cookie from 'react-cookies';
import { history } from '../_helper/history.js';

export const userActions = {
    login,
    logout,
    register,
    update,
};

function login(username, password) {
    return async dispatch => {
        dispatch(request({ username }));
        const data = {
            id: username,
            password: password
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        try {
            const response = await axios.post(SERVER_URL + '/user/login', data);
            history.push('/login');
            dispatch(success(response.data));
        }
        catch (error) {
            const msg = (error?.response?.data?.code === "INVALID_LOGIN") ? ["Invalid user ID or password"] : Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) {
        return { type: userConstants.LOGIN_SUCCESS, user }
    }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    cookie.remove('cookie', { path: '/' });
    return ({ type: userConstants.LOGOUT });
}

function register(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await axios.post(SERVER_URL + '/user/signup', data);
            dispatch(success(response.data));
            history.push('/signup');
        } catch (error) {
            const data = error.response.data;
            const msg = (data && data?.code === "ER_DUP_ENTRY") ? ["User ID already exists, please login"] : Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }

    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function update(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await axios.put(SERVER_URL + '/user/update', data);
            dispatch(success(response.data));
            dispatch(alertActions.success('User updated successfully'));
        } catch (error) {
            const data = error.response.data;
            let msg = ["Some error occured, please try again."];
            if (data && data?.code) {
                switch (data?.code) {
                    case "INVALID_USER_ID":
                        msg = ["Invalid user ID"];
                        break;
                    case "INVALID_PASSWORD":
                        msg = ["Invalid current password"];
                        break;
                    default:
                    // Fall through.
                }
            } else if (Array.isArray(data)) {
                msg = data.map(d => d.message);
            }
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }

    };

    function request(user) { return { type: userConstants.UPDATE_REQUEST, user } }
    function success(user) { return { type: userConstants.UPDATE_SUCCESS, user } }
    function failure(error) { return { type: userConstants.UPDATE_FAILURE, error } }
}
