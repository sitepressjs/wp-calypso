/**
 * External dependencies
 */
import request from 'superagent';

import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE
} from 'state/action-types';
import {
	GRAVATAR_CACHE_EXPIRATION
} from 'state/current-user/gravatar-status/constants';

export function uploadGravatar( file, bearerToken, email ) {
	return dispatch => {
		dispatch( { type: GRAVATAR_UPLOAD_REQUEST } );
		const data = new window.FormData();
		data.append( 'filedata', file );
		data.append( 'account', email );
		return request
			.post( 'https://api.gravatar.com/v1/upload-image' )
			.send( data )
			.set( 'Authorization', 'Bearer ' + bearerToken )
			.then( () => {
				const fileReader = new window.FileReader( file );
				fileReader.addEventListener( 'load', function() {
					dispatch( {
						type: GRAVATAR_UPLOAD_RECEIVE,
						expiration: Date.now() + GRAVATAR_CACHE_EXPIRATION,
						src: fileReader.result
					} );
					dispatch( {
						type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
					} );
				} );
				fileReader.readAsDataURL( file );
			} )
			.catch( () => {
				dispatch( {
					type: GRAVATAR_UPLOAD_REQUEST_FAILURE
				} );
			} );
	};
}
