/**
 * External dependencies
 */
import { has } from 'lodash';

export function isCurrentUserUploadingGravatar( state ) {
	return has( state, 'currentUser.gravatarStatus.isUploading' ) &&
		state.currentUser.gravatarStatus.isUploading;
}

export function getCurrentUserTempImage( state ) {
	return has( state, 'currentUser.gravatarStatus.tempImage.src' ) &&
		state.currentUser.gravatarStatus.tempImage.src;
}

export function getCurrentUserTempImageExpiration( state ) {
	return has( state, 'currentUser.gravatarStatus.tempImage.expiration' ) &&
		state.currentUser.gravatarStatus.tempImage.expiration;
}
