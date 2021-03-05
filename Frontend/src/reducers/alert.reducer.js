import { alertConstants } from '../_constants';

export function alert(state = {}, action) {
    switch (action.type) {
        case alertConstants.SUCCESS:
            return {
                type: 'alert-success',
                messages: action.messages
            };
        case alertConstants.ERROR:
            return {
                type: 'alert-danger',
                messages: action.messages
            };
        case alertConstants.CLEAR:
            return {};
        default:
            return state
    }
}