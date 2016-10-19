/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { normalizeThemeForApi } from './utils';
import {
	THEME_DELETE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_EDIT,
	THEME_EDITS_RESET,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEME_RESTORE,
	THEME_RESTORE_FAILURE,
	THEME_RESTORE_SUCCESS,
	THEME_SAVE,
	THEME_SAVE_SUCCESS,
	THEME_SAVE_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a theme object has
 * been received.
 *
 * @param  {Object} theme Theme received
 * @return {Object}      Action object
 */
export function receiveTheme( theme ) {
	return receiveThemes( [ theme ] );
}

/**
 * Returns an action object to be used in signalling that theme objects have
 * been received.
 *
 * @param  {Array}  themes Themes received
 * @return {Object}       Action object
 */
export function receiveThemes( themes ) {
	return {
		type: THEMES_RECEIVE,
		themes
	};
}

/**
 * Triggers a network request to fetch themes for the specified site and query.
 *
 * @param  {?Number}  siteId    Site ID
 * @param  {Boolean}  isJetpack If the site is a Jetpack site
 * @param  {String}   query     Theme query
 * @return {Function}           Action thunk
 */
export function requestThemes( siteId, isJetpack = false, query = {} ) {
	return ( dispatch ) => {
		let siteIdToQuery, siteIdToStore, queryWithApiVersion;

		if ( isJetpack ) {
			siteIdToQuery = siteId;
			siteIdToStore = siteId;
			queryWithApiVersion = { ...query, apiVersion: '1' };
		} else {
			siteIdToQuery = null;
			siteIdToStore = 'wpcom'; // Themes for all wpcom sites go into 'wpcom' subtree
			queryWithApiVersion = { ...query, apiVersion: '1.2' };
		}

		dispatch( {
			type: THEMES_REQUEST,
			siteId: siteIdToStore,
			query
		} );

		return wpcom.undocumented.themes( siteIdToQuery, queryWithApiVersion ).then( ( { found, themes } ) => {
			dispatch( receiveThemes( themes ) );
			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId: siteIdToStore,
				query,
				found,
				themes
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId: siteIdToStore,
				query,
				error
			} );
		} );
	};
}

/**
 * Triggers a network request to fetch a specific theme from a site.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @return {Function}        Action thunk
 */
export function requestSiteTheme( siteId, themeId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId
		} );

		return wpcom.site( siteId ).theme( themeId ).get().then( ( theme ) => {
			dispatch( receiveTheme( theme ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_REQUEST_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that the specified
 * theme updates should be applied to the set of edits.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @param  {Object} theme   Theme attribute updates
 * @return {Object}        Action object
 */
export function editTheme( siteId, themeId = null, theme ) {
	return {
		type: THEME_EDIT,
		theme,
		siteId,
		themeId
	};
}

/**
 * Returns an action object to be used in signalling that any theme edits for
 * the specified theme should be discarded.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @return {Object}        Action object
 */
export function resetThemeEdits( siteId, themeId ) {
	return {
		type: THEME_EDITS_RESET,
		siteId,
		themeId
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to save the specified theme object.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @param  {Object}   theme   Theme attributes
 * @return {Function}        Action thunk
 */
export function saveTheme( siteId, themeId = null, theme ) {
	return async ( dispatch ) => {
		dispatch( {
			type: THEME_SAVE,
			siteId,
			themeId,
			theme
		} );

		let themeHandle = wpcom.site( siteId ).theme( themeId );
		const normalizedTheme = normalizeThemeForApi( theme );
		themeHandle = themeHandle[ themeId ? 'update' : 'add' ].bind( themeHandle );
		return themeHandle( { apiVersion: '1.2' }, normalizedTheme ).then( ( savedTheme ) => {
			dispatch( {
				type: THEME_SAVE_SUCCESS,
				siteId,
				themeId,
				savedTheme,
				theme
			} );
			dispatch( receiveTheme( savedTheme ) );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_SAVE_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to trash the specified theme.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @return {Function}        Action thunk
 */
export function trashTheme( siteId, themeId ) {
	return saveTheme( siteId, themeId, { status: 'trash' } );
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to delete the specified theme. The theme should already have a status of trash
 * when dispatching this action, else you should use `trashTheme`.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @return {Function}        Action thunk
 */
export function deleteTheme( siteId, themeId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_DELETE,
			siteId,
			themeId
		} );

		return wpcom.site( siteId ).theme( themeId ).delete().then( () => {
			dispatch( {
				type: THEME_DELETE_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_DELETE_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}

/**
 * Returns an action thunk which, when dispatched, triggers a network request
 * to restore the specified theme.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @return {Function}        Action thunk
 */
export function restoreTheme( siteId, themeId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_RESTORE,
			siteId,
			themeId
		} );

		return wpcom.site( siteId ).theme( themeId ).restore().then( ( restoredTheme ) => {
			dispatch( {
				type: THEME_RESTORE_SUCCESS,
				siteId,
				themeId
			} );
			dispatch( receiveTheme( restoredTheme ) );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_RESTORE_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}
