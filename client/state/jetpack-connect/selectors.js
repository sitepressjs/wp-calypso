/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteByUrl } from 'state/sites/selectors';

const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // an hour

const getConnectingSite = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSite' ] );
};

const getAuthorizationData = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectAuthorize' ] );
};

const getAuthorizationRemoteQueryData = ( state ) => {
	return get( getAuthorizationData( state ), [ 'queryObject' ] );
};

const getAuthorizationRemoteSiteUrl = ( state ) => {
	return get( getAuthorizationRemoteQueryData( state ), [ 'site' ] );
};

const getAuthorizationRemoteSite = ( state ) => {
	const remoteUrl = getAuthorizationRemoteSiteUrl( state );

	if ( ! remoteUrl ) {
		return null;
	}

	return getSiteByUrl( state, remoteUrl );
};

const getSessions = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackConnectSessions' ] );
};

const getSSOSessions = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackSSOSessions' ] );
};

const getSSO = ( state ) => {
	return get( state, [ 'jetpackConnect', 'jetpackSSO' ] );
};

const isCalypsoStartedConnection = function( state, siteSlug ) {
	if ( ! siteSlug ) {
		return false;
	}
	const site = siteSlug.replace( /.*?:\/\//g, '' );
	const sessions = getSessions( state );

	if ( sessions[ site ] ) {
		const currentTime = ( new Date() ).getTime();
		return ( currentTime - sessions[ site ].timestamp < JETPACK_CONNECT_TTL );
	}

	return false;
};

const getFlowType = function( state, siteSlug ) {
	const sessions = getSessions( state );
	if ( siteSlug && sessions[ siteSlug ] ) {
		return sessions[ siteSlug ].flowType;
	}
	return false;
};

const getJetpackSiteByUrl = ( state, url ) => {
	const site = getSiteByUrl( state, url );
	if ( site && ! site.jetpack ) {
		return null;
	}
	return site;
};

/**
 * XMLRPC errors can be identified by the presence of an error message, the presence of an authorization code
 * and if the error message contains the string 'error'
 *
 * @param {object} state Global state tree
 * @returns {Boolean} If there's an xmlrpc error or not
 */
const hasXmlrpcError = function( state ) {
	const authorizeData = getAuthorizationData( state );

	return (
		authorizeData &&
		authorizeData.authorizeError &&
		authorizeData.authorizeError.message &&
		authorizeData.authorizationCode &&
		authorizeData.authorizeError.message.indexOf( 'error' ) > -1
	);
};

const getJetpackPlanSelected = function( state ) {
	const selectedPlans = state.jetpackConnect.jetpackConnectSelectedPlans;
	const siteUrl = state.jetpackConnect.jetpackConnectAuthorize.queryObject.site;

	if ( siteUrl ) {
		const siteSlug = siteUrl.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
		if ( selectedPlans && selectedPlans[ siteSlug ] ) {
			return selectedPlans[ siteSlug ];
		}
	}
	return false;
};

const getSiteSelectedPlan = function( state, siteSlug ) {
	return state.jetpackConnect.jetpackConnectSelectedPlans && state.jetpackConnect.jetpackConnectSelectedPlans[ siteSlug ];
};

const getGlobalSelectedPlan = function( state ) {
	return state.jetpackConnect.jetpackConnectSelectedPlans && state.jetpackConnect.jetpackConnectSelectedPlans[ '*' ];
};

export default {
	getConnectingSite,
	getAuthorizationData,
	getAuthorizationRemoteQueryData,
	getAuthorizationRemoteSite,
	getAuthorizationRemoteSiteUrl,
	getSessions,
	getSSOSessions,
	getSSO,
	isCalypsoStartedConnection,
	getFlowType,
	getJetpackSiteByUrl,
	hasXmlrpcError,
	getJetpackPlanSelected,
	getSiteSelectedPlan,
	getGlobalSelectedPlan
};
