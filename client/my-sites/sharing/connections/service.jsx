/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { filter, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountDialog from './account-dialog';
import {
	createSiteConnection,
	deleteSiteConnection,
	failCreateConnection,
	fetchConnections,
	updateSiteConnection,
} from 'state/sharing/publicize/actions';
import { errorNotice, successNotice, warningNotice } from 'state/notices/actions';
import FoldableCard from 'components/foldable-card';
import { getCurrentUser, getCurrentUserId } from 'state/current-user/selectors';
import { getKeyringConnectionsByName, getAvailableExternalConnections } from 'state/sharing/keyring/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUserConnectionsForService, isFetchingConnections } from 'state/sharing/publicize/selectors';
import observe from 'lib/mixins/data-observe';
import PopupMonitor from 'lib/popup-monitor';
import { recordGoogleEvent } from 'state/analytics/actions';
import ServiceAction from './service-action';
import ServiceConnectedAccounts from './service-connected-accounts';
import ServiceDescription from './service-description';
import ServiceExamples from './service-examples';
import services from './services';
import ServiceTip from './service-tip';
import SocialLogo from 'components/social-logo';

const SharingService = React.createClass( {
	displayName: 'SharingService',

	propTypes: {
		site: React.PropTypes.object,                    // The site for which connections are created
		user: React.PropTypes.object,                    // A user object
		service: React.PropTypes.object.isRequired,      // The single service object
		connections: React.PropTypes.object,             // A collections-list instance
	},

	mixins: [ observe( 'connections' ) ],

	/**
	 * Returns the available connections for the current user.
	 *
	 * @return {Array} Available connections.
	 */
	getConnections: function() {
		return this.filter( 'getConnections', this.props.service.ID, this.props.siteUserConnections, arguments );
	},

	/**
	 * Given a service name, returns the connections for which the current user is permitted to remove.
	 *
	 * @param {string} service The name of the service
	 * @return {Array} Connections for which the current user is permitted to remove
	 */
	getRemovableConnections: function( service ) {
		const connections = this.getConnections().filter( ( connection ) => (
			this.props.site.capabilities && this.props.site.capabilities.edit_others_posts ||
				connection.user_ID === this.props.user.ID
		) );

		return this.filter( 'getRemovableConnections', service, connections, arguments );
	},

	/**
	 * Given an array of connection objects which are desired to be destroyed,
	 * returns a filtered set of connection objects to be destroyed. This
	 * enables service-specific handlers to react to destroy events.
	 *
	 * @param {Array|Object} connections A connection or array of connections
	 * @return {Array} Filtered set of connection objects to be destroyed
	 */
	filterConnectionsToRemove: function( connections ) {
		if ( ! Array.isArray( connections ) ) {
			connections = [ connections ];
		}

		return connections.filter( ( connection ) => this.filter( 'filterConnectionToRemove', connection.service, true, arguments ), this );
	},

	/**
	 * Given a service name and optional site ID, returns whether the Keyring
	 * authorization attempt succeeded in creating new Keyring account options.
	 *
	 * @param {string} service The name of the service
	 * @param {int}    siteId  An optional site ID
	 * @return {Boolean} Whether the Keyring authorization attempt succeeded
	 */
	didKeyringConnectionSucceed: function( service, siteId = 0 ) {
		const externalConnections = this.props.availableExternalConnections,
			isAnyConnectionOptions = some( externalConnections, { isConnected: false } );

		if ( ! externalConnections.length ) {
			// At this point, if there are no available accounts to
			// select, we must assume the user closed the popup
			// before completing the authorization step.
			this.props.failCreateConnection( {
				message: this.props.translate( 'The %(service)s connection could not be made because no account was selected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} ),
			} );
			this.setState( { isConnecting: false } );
		} else if ( ! isAnyConnectionOptions ) {
			// Similarly warn user if all options are connected
			this.props.failCreateConnection( {
				message: this.props.translate( 'The %(service)s connection could not be made because all available accounts are already connected.', {
					args: { service: this.props.service.label },
					context: 'Sharing: Publicize connection confirmation',
				} )
			} );
			this.setState( { isConnecting: false } );
		}

		return this.filter( 'didKeyringConnectionSucceed', service, externalConnections.length && isAnyConnectionOptions, [
			...arguments,
			externalConnections,
			siteId,
		] );
	},

	/**
	 * Passes value through a service-specific handler if one exists, allowing
	 * for service logic to be performed or the value to be modified.
	 *
	 * @param  {string} functionName      A function name to invoke
	 * @param  {string} serviceName       The name of the service
	 * @param  {*}      value             The value returned by original logic
	 * @param  {object} functionArguments An Array-like arguments object
	 * @return {*} The value returned by original logic.
	 */
	filter: function( functionName, serviceName, value, functionArguments ) {
		if ( serviceName in services && services[ serviceName ][ functionName ] ) {
			return services[ serviceName ][ functionName ].apply(
				this, [ value ].concat( Array.prototype.slice.call( functionArguments ) )
			);
		}

		return value;
	},

	getInitialState: function() {
		return {
			isOpen: false,          // The service is visually opened
			isConnecting: false,    // A pending connection is awaiting authorization
			isDisconnecting: false, // A pending disconnection is awaiting completion
			isRefreshing: false,    // A pending refresh is awaiting completion
			isSelectingAccount: false,
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.getConnections().length !== nextProps.siteUserConnections.length ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
				isSelectingAccount: false,
			} );
		}
	},

	componentWillUnmount: function() {
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );
		this.props.connections.off( 'refresh:error', this.onRefreshError );
	},

	onRefreshSuccess: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:error', this.onRefreshError );

		this.props.successNotice( this.props.translate( 'The %(service)s account was successfully reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	onRefreshError: function() {
		this.setState( { isRefreshing: false } );
		this.props.connections.off( 'refresh:success', this.onRefreshSuccess );

		this.props.errorNotice( this.props.translate( 'The %(service)s account was unable to be reconnected.', {
			args: { service: this.props.service.label },
			context: 'Sharing: Publicize reconnection confirmation'
		} ) );
	},

	refresh: function( oldConnection ) {
		this.setState( { isRefreshing: true } );
		this.props.connections.once( 'refresh:success', this.onRefreshSuccess );
		this.props.connections.once( 'refresh:error', this.onRefreshError );

		if ( ! oldConnection ) {
			// When triggering a refresh from the primary action button, find
			// the first broken connection owned by the current user.
			oldConnection = this.getConnections().filter( ( connection ) => ( 'broken' === connection.status ) );
		}
		this.refreshConnection( oldConnection );
	},

	performAction: function() {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID ),
			removableConnections = this.getRemovableConnections( this.props.service.ID );

		// Depending on current status, perform an action when user clicks the
		// service action button
		if ( 'connected' === connectionStatus && removableConnections.length ) {
			this.removeConnection( removableConnections );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Disconnect Button', this.props.service.ID );
		} else if ( 'reconnect' === connectionStatus ) {
			this.refresh();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Reconnect Button', this.props.service.ID );
		} else {
			this.addConnection();
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button', this.props.service.ID );
		}
	},

	addConnection: function( service = this.props.service, keyringConnectionId, externalUserId = false ) {
		const _this = this,
			siteId = this.props.site.ID;

		this.setState( { isConnecting: true } );

		if ( service ) {
			if ( keyringConnectionId ) {
				// Since we have a Keyring connection to work with, we can immediately
				// create or update the connection
				const keyringConnections = filter( this.props.keyringConnections, { ID: keyringConnectionId } );

				if ( siteId && externalUserId && keyringConnections.length ) {
					// If a Keyring connection is already in use by another connection,
					// we should trigger an update. There should only be one connection,
					// so we're correct in using the connection ID from the first
					this.props.updateSiteConnection( siteId, keyringConnections[ 0 ].ID, { external_user_ID: externalUserId } );
				} else {
					this.props.createSiteConnection( siteId, keyringConnectionId, externalUserId );
				}

				this.props.recordGoogleEvent( 'Sharing', 'Clicked Connect Button in Modal', this.props.service.ID );
			} else {
				// Attempt to create a new connection. If a Keyring connection ID
				// is not provided, the user will need to authorize the app
				const popupMonitor = new PopupMonitor();

				popupMonitor.open( service.connect_URL, null, 'toolbar=0,location=0,status=0,menubar=0,' +
					popupMonitor.getScreenCenterSpecs( 780, 500 ) );

				popupMonitor.once( 'close', () => {
					// In the case that a Keyring connection doesn't exist, wait for app
					// authorization to occur, then display with the available connections
					if ( this.didKeyringConnectionSucceed( service.ID, siteId ) && 'publicize' === service.type ) {
						_this.setState( { isSelectingAccount: true } );
					}
				} );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.warningNotice( this.props.translate( 'The connection could not be made because no account was selected.', {
				context: 'Sharing: Publicize connection confirmation'
			} ) );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.props.service.ID );
		}

		// Reset active account selection
		this.setState( { isSelectingAccount: false } );
	},

	refreshConnection: function( connection ) {
		this.props.connections.refresh( connection );
	},

	/**
	 * Deletes the passed connections.
	 *
	 * @param {Array} connections Optional. Connections to be deleted.
	 *                            Default: All connections for this service.
	 */
	removeConnection: function( connections = this.getRemovableConnections( this.props.service.ID ) ) {
		this.setState( { isDisconnecting: true } );

		connections = this.filterConnectionsToRemove( connections );
		connections.map( this.props.deleteSiteConnection );
	},

	toggleSitewideConnection: function( connection, isSitewide ) {
		this.props.connections.update( connection, { shared: isSitewide } );
	},

	/**
	 * Given a service name and optional site ID, returns the current status of the
	 * service's connection.
	 *
	 * @param {string} service The name of the service to check
	 * @return {string} Connection status.
	 */
	getConnectionStatus: function( service ) {
		let status;

		if ( this.props.isFetching ) {
			// When connections are still loading, we don't know the status
			status = 'unknown';
		} else if ( ! some( this.getConnections(), { service } ) ) {
			// If no connections exist, the service isn't connected
			status = 'not-connected';
		} else if ( some( this.getConnections(), { status: 'broken' } ) ) {
			// A problematic connection exists
			status = 'reconnect';
		} else {
			// If all else passes, assume service is connected
			status = 'connected';
		}

		return this.filter( 'getConnectionStatus', service, status, arguments );
	},

	render: function() {
		const connectionStatus = this.getConnectionStatus( this.props.service.ID ),
			elementClass = [
				'sharing-service',
				this.props.service.ID,
				connectionStatus,
				this.state.isOpen ? 'is-open' : ''
			].join( ' ' ),
			iconsMap = {
				Facebook: 'facebook',
				Twitter: 'twitter',
				'Google+': 'google-plus',
				LinkedIn: 'linkedin',
				Tumblr: 'tumblr',
				Path: 'path',
				Eventbrite: 'eventbrite'
			},
			accounts = this.state.isSelectingAccount ? this.props.availableExternalConnections : [];

		const header = (
			<div>
				<SocialLogo
					icon={ iconsMap[ this.props.service.label ] }
					size={ 48 }
					className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h2>{ this.props.service.label }</h2>
					<ServiceDescription
						service={ this.props.service }
						status={ connectionStatus }
						numberOfConnections={ this.getConnections().length } />
				</div>
			</div>
		);

		const content = (
			<div
				className={ 'sharing-service__content ' + ( this.props.isFetching ? 'is-placeholder' : '' ) }>
				<ServiceExamples service={ this.props.service } />
				<ServiceConnectedAccounts
					connections={ this.getConnections() }
					isDisconnecting={ this.state.isDisconnecting }
					isRefreshing={ this.state.isRefreshing }
					onAddConnection={ this.addConnection }
					onRefreshConnection={ this.refresh }
					onRemoveConnection={ this.removeConnection }
					onToggleSitewideConnection={ this.toggleSitewideConnection }
					service={ this.props.service } />
				<ServiceTip service={ this.props.service } />
			</div> );

		const action = (
			<ServiceAction
				status={ connectionStatus }
				service={ this.props.service }
				onAction={ this.performAction }
				isConnecting={ this.state.isConnecting }
				isRefreshing={ this.state.isRefreshing }
				isDisconnecting={ this.state.isDisconnecting }
				removableConnections={ this.getRemovableConnections( this.props.service.ID ) } />
		);
		return (
			<div>
				<AccountDialog
					isVisible={ this.state.isSelectingAccount }
					service={ this.props.service }
					accounts={ accounts }
					onAccountSelected={ this.addConnection } />
				<FoldableCard
					className={ elementClass }
					header={ header }
					clickableHeader
					compact
					summary={ action }
					expandedSummary={ action } >
					{ content }
				</FoldableCard>
			</div>
		);
	}
} );

export default connect(
	( state, { service } ) => ( {
		availableExternalConnections: getAvailableExternalConnections( state, service.ID ),
		isFetching: isFetchingConnections( state, getSelectedSiteId( state ) ),
		keyringConnections: getKeyringConnectionsByName( state, service.ID ),
		site: getSelectedSite( state ),
		siteUserConnections: getSiteUserConnectionsForService(
			state, getSelectedSiteId( state ), getCurrentUserId( state ), service.ID
		),
		user: getCurrentUser( state ),
	} ),
	{
		createSiteConnection,
		deleteSiteConnection,
		errorNotice,
		failCreateConnection,
		fetchConnections,
		recordGoogleEvent,
		successNotice,
		updateSiteConnection,
		warningNotice,
	},
)( localize( SharingService ) );
