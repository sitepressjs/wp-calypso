/**
 * External dependencies
 */
import { includes } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import {
	getSerializedThemesQuery,
	normalizeThemeForDisplay
} from './utils';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * Returns a theme object by its ID.
 *
 * @param  {Object} state Global state tree
 * @param  {String} id    Theme ID
 * @return {Object}       Theme object
 */
export function getTheme( state, id ) {
	const path = state.themes.items[ id ];
	if ( ! path ) {
		return null;
	}

	const [ siteId, themeId ] = path;
	const manager = state.themes.queries[ siteId ];
	if ( ! manager ) {
		return null;
	}

	return manager.getItem( themeId );
}

/**
 * Returns an array of theme objects by site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site themes
 */
export const getSiteThemes = createSelector(
	( state, siteId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return [];
		}

		return manager.getItems();
	},
	( state ) => state.themes.queries
);

/**
 * Returns a theme object by site ID, theme ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  themeId Theme ID
 * @return {?Object}        Theme object
 */
export const getSiteTheme = createSelector(
	( state, siteId, themeId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);

/**
 * Returns an array of normalized themes for the themes query, or null if no
 * themes have been received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Array}         Themes for the theme query
 */
export const getSiteThemesForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		const themes = manager.getItems( query );
		if ( ! themes ) {
			return null;
		}

		// ThemeQueryManager will return an array including undefined entries if
		// it knows that a page of results exists for the query (via a previous
		// request's `found` value) but the items haven't been received. While
		// we could impose this on the developer to accommodate, instead we
		// simply return null when any `undefined` entries exist in the set.
		if ( includes( themes, undefined ) ) {
			return null;
		}

		return themes.map( normalizeThemeForDisplay );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);

/**
 * Returns true if currently requesting themes for the themes query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {Boolean}        Whether themes are being requested
 */
export function isRequestingSiteThemesForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedThemesQuery( query, siteId );
	return !! state.themes.queryRequests[ serializedQuery ];
}

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable themes if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Number}        Total number of found items
 */
export function getSiteThemesFoundForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	return state.themes.queries[ siteId ].getFound( query );
}

/**
 * Returns the last queryable page of themes for the given query, or null if the
 * total number of queryable themes if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Number}        Last themes page
 */
export function getSiteThemesLastPageForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	const pages = state.themes.queries[ siteId ].getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	return Math.max( pages, 1 );
}

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable themes if unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @param  {Object}   query  Theme query object
 * @return {?Boolean}        Whether last themes page has been reached
 */
export function isSiteThemesLastPageForQuery( state, siteId, query = {} ) {
	const lastPage = getSiteThemesLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === ( query.page || DEFAULT_THEME_QUERY.page );
}

/**
 * Returns true if a request is in progress for the specified site theme, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}        Whether request is in progress
 */
export function isRequestingSiteTheme( state, siteId, themeId ) {
	if ( ! state.themes.siteRequests[ siteId ] ) {
		return false;
	}

	return !! state.themes.siteRequests[ siteId ][ themeId ];
}
