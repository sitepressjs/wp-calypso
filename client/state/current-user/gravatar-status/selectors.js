/**
 * External dependencies
 */
import has from 'lodash/has';

export function isCurrentUserUploadingGravatar( state ) {
	return has( state, 'currentUser.gravatarStatus.isUploading' ) &&
		state.currentUser.gravatarStatus.isUploading;
}

export function getCurrentUserTempImage( state ) {
	return has( state, 'currentUser.gravatarStatus.items.tempImage' ) &&
		state.currentUser.gravatarStatus.items.tempImage;
}

export function getCurrentUserTempImageExpiration( state ) {
	return has( state, 'currentUser.gravatarStatus.items.expiration' ) &&
		state.currentUser.gravatarStatus.items.expiration;
}
