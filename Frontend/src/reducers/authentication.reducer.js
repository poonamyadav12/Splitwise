import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {};

export function authentication(state = initialState, action) {
    switch (action.type) {
        case userConstants.LOGIN_REQUEST:
            return {
                loggingIn: true,
            };
        case userConstants.LOGIN_SUCCESS:
        case userConstants.UPDATE_SUCCESS:
        case userConstants.REGISTER_SUCCESS:
            localStorage.setItem('user', JSON.stringify(action.user));
            return {
                loggedIn: true,
                user: action.user
            };
        case userConstants.LOGIN_FAILURE:
            return {};
        case userConstants.LOGOUT:
            localStorage.setItem('user', null);
            return {};
        default:
            return state
    }
}