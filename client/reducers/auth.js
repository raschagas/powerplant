import {
	SET_CURRENT_USER,
	CREATE_USER,
	LOGOUT
} from '../actions';

const initialState = {
	isAuthenticated: false
};

/**
 * @param {Object} state Current state
 * @param {Object} action Action object
 * @return {state} Next state
 */
export function auth(state = initialState, action) {
	switch (action.type) {
		case SET_CURRENT_USER:
			if (action.user) {
				return {
					isAuthenticated: true,
					currentUser: action.user
				};
			} else {
				return {
					isAuthenticated: false
				};
			}
		case LOGOUT:
			return {
				isAuthenticated: false
			};
		default:
			return state;
	}
};
