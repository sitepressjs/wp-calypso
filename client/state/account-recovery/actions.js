/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_LOOKUP_ERROR,
	ACCOUNT_RECOVERY_LOOKUP_RECEIVE,
	ACCOUNT_RECOVERY_LOOKUP_REQUEST,
} from 'state/action-types';
import wpcom from 'lib/wp';

export function getResetOptions( userData ) {
	return ( dispatch ) => {
		dispatch( { type: ACCOUNT_RECOVERY_LOOKUP_REQUEST } );

		wpcom.undocumented().accountRecovery( userData ).getResetOptions()
			.then( options => dispatch( { type: ACCOUNT_RECOVERY_LOOKUP_RECEIVE, options } ) )
			.catch( error => dispatch( { type: ACCOUNT_RECOVERY_LOOKUP_ERROR, error } ) );
	};
}
