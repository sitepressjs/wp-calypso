/**
 * External dependencies
 */
import { has, get, includes, isEqual, omit, some } from 'lodash';
import createSelector from 'lib/create-selector';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import {
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getDeserializedThemesQueryDetails,
	getSerializedThemesQueryWithoutPage,
	mergeIgnoringArrays,
	normalizeThemeForEditing,
	normalizeThemeForDisplay
} from './utils';
import { DEFAULT_THEME_QUERY, DEFAULT_NEW_THEME_VALUES } from './constants';
import addQueryArgs from 'lib/route/add-query-args';

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
 * Returns an array of normalized themes for the themes query, including all
 * known queried pages, or null if the themes for the query are not known.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {?Array}         Themes for the theme query
 */
export const getSiteThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const themes = state.themes.queries[ siteId ];
		if ( ! themes ) {
			return null;
		}

		const itemsIgnoringPage = themes.getItemsIgnoringPage( query );
		if ( ! itemsIgnoringPage ) {
			return null;
		}

		return itemsIgnoringPage.map( normalizeThemeForDisplay );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQueryWithoutPage( query, siteId )
);

/**
 * Returns true if currently requesting themes for the themes query, regardless
 * of page, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Theme query object
 * @return {Boolean}        Whether themes are being requested
 */
export const isRequestingSiteThemesForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedThemesQuery( query ), 'page' );
		return some( state.themes.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedThemesQueryDetails( serializedQuery );
			if ( queryDetails.siteId !== siteId ) {
				return false;
			}

			return isEqual(
				normalizedQueryWithoutPage,
				omit( queryDetails.query, 'page' )
			);
		} );
	},
	( state ) => state.themes.queryRequests,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);

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

/**
 * Returns a theme object by site ID theme ID pairing, with editor revisions.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @return {Object}        Theme object with revisions
 */
export function getEditedTheme( state, siteId, themeId ) {
	const theme = getSiteTheme( state, siteId, themeId );
	const edits = getThemeEdits( state, siteId, themeId );
	if ( ! edits ) {
		return theme;
	}

	if ( ! theme ) {
		return edits;
	}

	return mergeIgnoringArrays( {}, theme, edits );
}

/**
 * Returns an object of edited theme attributes for the site ID theme ID pairing.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @return {Object}        Theme revisions
 */
export function getThemeEdits( state, siteId, themeId ) {
	const { edits } = state.themes;
	return normalizeThemeForEditing( get( edits, [ siteId, themeId || '' ], null ) );
}

/**
 * Returns the assigned value for the edited theme by field key.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @param  {String} field  Field value to retrieve
 * @return {*}             Field value
 */
export function getEditedThemeValue( state, siteId, themeId, field ) {
	return get( getEditedTheme( state, siteId, themeId ), field );
}

/**
 * Returns true if there are "dirty" edited fields to be saved for the theme
 * corresponding with the site ID theme ID pair, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}        Whether dirty fields exist
 */
export const isEditedThemeDirty = createSelector(
	( state, siteId, themeId ) => {
		const theme = getSiteTheme( state, siteId, themeId );
		const edits = getThemeEdits( state, siteId, themeId );

		return some( edits, ( value, key ) => {
			if ( key === 'type' ) {
				return false;
			}

			if ( theme ) {
				return theme[ key ] !== value;
			}

			return (
				! DEFAULT_NEW_THEME_VALUES.hasOwnProperty( key ) ||
				value !== DEFAULT_NEW_THEME_VALUES[ key ]
			);
		} );
	},
	( state ) => [ state.themes.items, state.themes.edits ]
);

/**
 * Returns true if the theme status is publish, private, or future
 * and the date is in the past
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  themeId Theme ID
 * @return {Boolean}        Whether theme is published
 */
export const isThemePublished = createSelector(
	( state, siteId, themeId ) => {
		const theme = getSiteTheme( state, siteId, themeId );

		if ( ! theme ) {
			return null;
		}

		return includes( [ 'publish', 'private' ], theme.status ) ||
			( theme.status === 'future' && moment( theme.date ).isBefore( moment() ) );
	},
	( state ) => state.themes.queries
);

/**
 * Returns the slug, or suggested_slug, for the edited theme
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} themeId Theme ID
 * @return {String}             Slug value
 */
export function getEditedThemeSlug( state, siteId, themeId ) {
	// if local edits exists, return them regardless of theme status
	const themeEdits = getThemeEdits( state, siteId, themeId );
	if ( has( themeEdits, 'slug' ) ) {
		return themeEdits.slug;
	}

	const theme = getSiteTheme( state, siteId, themeId );
	const themeSlug = get( theme, 'slug' );

	// when theme is published, return the slug
	if ( isThemePublished( state, siteId, themeId ) ) {
		return themeSlug;
	}

	// only return suggested_slug if slug has not been edited
	const suggestedSlug = get( theme, [ 'other_URLs', 'suggested_slug' ] );
	if ( suggestedSlug && ! themeSlug ) {
		return suggestedSlug;
	}

	return themeSlug;
}

/**
 * Returns the most reliable preview URL for the theme by site ID, theme ID pair,
 * or null if a preview URL cannot be determined.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  themeId Theme ID
 * @return {?String}        Theme preview URL
 */
export function getThemePreviewUrl( state, siteId, themeId ) {
	const theme = getSiteTheme( state, siteId, themeId );
	if ( ! theme ) {
		return null;
	}

	const { URL: url, status } = theme;
	if ( ! url || status === 'trash' ) {
		return null;
	}

	if ( theme.preview_URL ) {
		return theme.preview_URL;
	}

	let previewUrl = url;
	if ( 'publish' !== status ) {
		previewUrl = addQueryArgs( {
			preview: true
		}, previewUrl );
	}

	return previewUrl;
}
