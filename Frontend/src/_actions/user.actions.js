import { userConstants } from '../_constants';
import { alertActions } from './';
import axios from 'axios';
import cookie from 'react-cookies';
import { history } from '/home/poonam/Documents/Splitwise-app/splitwise-app/Frontend/src/_helper/history.js';

export const userActions = {
    login,
    logout,
    register
};

function login(username, password) {

    return async dispatch => {

        dispatch(request({ username }));
        console.log("Inside user Action ");
        const data = {
            id: username,
            password: password
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        try {
            const user = await axios.post('http://localhost:3001/user/login', data);
            history.push('/login');
            dispatch(success(user));
        }
        catch (error) {
            console.log("Erro " + JSON.stringify(error));
            const msg = (error?.response?.data?.code === "INVALID_LOGIN") ? ["Invalid user ID or password"] : Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    console.log("Logou called ");
    cookie.remove('cookie', { path: '/' });
    return ({ type: userConstants.LOGOUT });
}

function register(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const user = await axios.post('http://localhost:3001/user/signup', data);
            dispatch(success(user));
            dispatch({ type: userConstants.LOGIN_SUCCESS, user })
            history.push('/signup');
        } catch (error) {
            console.log("Error " + JSON.stringify(error));
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
