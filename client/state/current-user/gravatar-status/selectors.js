/**
 * External dependencies
 */
import { has } from 'lodash';

export function isCurrentUserUploadingGravatar( state ) {
	return has( state, 'currentUser.gravatarStatus.isUploading' ) &&
		state.currentUser.gravatarStatus.isUploading;
}

export function getCurrentUserTempGravatarExpiration( state ) {
	return has( state, 'currentUser.gravatarStatus.tempImage.expiration' ) &&
		state.currentUser.gravatarStatus.tempImage.expiration;
}

export function getUserTempGravatar( state, userId ) {
	return state.currentUser.id === userId &&
		has( state, 'currentUser.gravatarStatus.tempImage.src' ) &&
		state.currentUser.gravatarStatus.tempImage.src;
}
