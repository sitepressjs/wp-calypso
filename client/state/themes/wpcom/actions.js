/**
 * External dependencies
 */
import { isNumber, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { normalizeThemeForApi } from './utils';
import { getEditedTheme } from 'state/themes/selectors';
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
 * @param  {?Number}  siteId Site ID
 * @param  {String}   query  Theme query
 * @return {Function}        Action thunk
 */
export function requestSiteThemes( siteId, query = {} ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEMES_REQUEST,
			siteId,
			query
		} );

		let source = wpcom;
		if ( source.skipLocalSyncResult ) {
			source = source.skipLocalSyncResult();
		}

		if ( siteId ) {
			source = source.site( siteId );
		} else {
			source = source.me();
		}

		return source.themesList( query ).then( ( { found, themes } ) => {
			dispatch( receiveThemes( themes ) );
			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId,
				query,
				found,
				themes
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId,
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
 * Returns a function which, when invoked, triggers a network request to fetch
 * themes across all of the current user's sites for the specified query.
 *
 * @param  {String}   query Theme query
 * @return {Function}       Action thunk
 */
export function requestThemes( query = {} ) {
	return requestSiteThemes( null, query );
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

/**
 * Returns an action thunk which, when dispatched, adds a term to the current edited theme
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   taxonomy Taxonomy Slug
 * @param  {Object}   term     Object of new term attributes
 * @param  {Number}   themeId   ID of theme to which term is associated
 * @return {Function}          Action thunk
 */
export function addTermForTheme( siteId, taxonomy, term, themeId ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const theme = getEditedTheme( state, siteId, themeId );

		// if there is no theme, no term, or term is temporary, bail
		if ( ! theme || ! term || ! isNumber( term.ID ) ) {
			return;
		}

		const themeTerms = theme.terms || {};

		// ensure we have an array since API returns an object
		const taxonomyTerms = toArray( themeTerms[ taxonomy ] );
		taxonomyTerms.push( term );

		dispatch( editTheme( siteId, themeId, {
			terms: {
				[ taxonomy ]: taxonomyTerms
			}
		} ) );
	};
}
