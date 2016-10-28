/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import url from 'url';
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import {
	USER_RECEIVE,
	GRAVATAR_UPLOAD_RECEIVE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case USER_RECEIVE:
			return Object.assign( {}, state, {
				[ action.user.ID ]: action.user
			} );
		case GRAVATAR_UPLOAD_RECEIVE:
			if ( ! has( state, [ action.userId, 'avatar_URL' ] ) ) {
				return state;
			}
			const oldUrl = state[ action.userId ].avatar_URL;
			const parsedUrl = url.parse( oldUrl, true );
			parsedUrl.query.v = action.expiration;
			delete parsedUrl.search; // delete search so that url uses query
			const newUrl = url.format( parsedUrl );
			return {
				...state,
				[ action.userId ]: {
					...state[ action.userId ],
					avatar_URL: newUrl
				}
			};
		case DESERIALIZE:
			return {};
		case SERIALIZE:
			return {};
	}

	return state;
}

export default combineReducers( {
	items
} );
