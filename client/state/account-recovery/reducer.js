/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_LOOKUP_ERROR,
	ACCOUNT_RECOVERY_LOOKUP_RECEIVE,
	ACCOUNT_RECOVERY_LOOKUP_REQUEST,
	SERIALIZE,
} from 'state/action-types';
import { createReducer } from 'state/utils';

const defaultUserOptions = {
	isRequesting: false,
};

export const resetOptions = createReducer( defaultUserOptions, {
	[ ACCOUNT_RECOVERY_LOOKUP_REQUEST ]: () => ( {
		isRequesting: true,
	} ),
	[ ACCOUNT_RECOVERY_LOOKUP_RECEIVE ]: ( { options } ) => ( {
		isRequesting: false,
		options,
	} ),
	[ ACCOUNT_RECOVERY_LOOKUP_ERROR ]: ( { error } ) => ( {
		isRequesting: true,
		error,
	} ),
	[ SERIALIZE ]: () => ( {} ),
} );

export default combineReducers( {
	resetOptions,
} );
