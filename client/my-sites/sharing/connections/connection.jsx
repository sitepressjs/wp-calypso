/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getUser } from 'state/users/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class SharingConnection extends Component {
	static propTypes = {
		site: PropTypes.object,                    // The site for which the connection was created
		user: PropTypes.object,                    // A user object
		connection: PropTypes.object.isRequired,   // The single connection object
		service: PropTypes.object.isRequired,      // The service to which the connection is made
		onDisconnect: PropTypes.func,              // Handler to invoke when disconnecting
		isDisconnecting: PropTypes.bool,           // Is a service disconnection request pending?
		showDisconnect: PropTypes.bool,            // Display an inline disconnect button
		onRefresh: PropTypes.func,                 // Handler to invoke when refreshing
		isRefreshing: PropTypes.bool,              // Is a service refresh request pending?
		onToggleSitewideConnection: PropTypes.func // Handler to invoke when toggling sitewide connection
	};

	static defaultProps = {
		isDisconnecting: false,
		isRefreshing: false,
		onDisconnect: () => {},
		onRefresh: () => {},
		onToggleSitewideConnection: () => {},
		showDisconnect: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isSavingSitewide: false
		};

		this.toggleSitewideConnection = this.toggleSitewideConnection.bind( this );
	}

	componentDidUpdate( prevProps ) {
		if ( this.state.isSavingSitewide && this.props.connection.shared !== prevProps.connection.shared ) {
			this.setState( { isSavingSitewide: false } );
		}
	}

	disconnect() {
		if ( ! this.props.isDisconnecting ) {
			this.props.onDisconnect( this.props.connection );
		}
	}

	refresh() {
		if ( ! this.props.isRefreshing ) {
			this.props.onRefresh( this.props.connection );
		}
	}

	getProfileImage() {
		if ( this.props.connection.external_profile_picture ) {
			return <img
				src={ this.props.connection.external_profile_picture }
				alt={ this.props.connection.label }
				className="sharing-connection__account-avatar" />;
		}

		return (
			<span className={ 'sharing-connection__account-avatar is-fallback ' + this.props.connection.service }>
				<span className="screen-reader-text">{ this.props.connection.label }</span>
			</span>
		);
	}

	getReconnectButton() {
		if ( this.props.user && 'broken' === this.props.connection.status &&
			this.props.user.ID === this.props.connection.keyring_connection_user_ID ) {
			return (
				<a onClick={ this.refresh } className="sharing-connection__account-action reconnect">
					{ this.props.translate( 'Reconnect' ) }
				</a>
			);
		}
	}

	getDisconnectButton() {
		const userCanDelete = this.props.site.capabilities && this.props.site.capabilities.edit_others_posts ||
			this.props.connection.user_ID === this.props.user.ID;

		if ( this.props.showDisconnect && userCanDelete ) {
			return (
				<a onClick={ this.disconnect } className="sharing-connection__account-action disconnect">
					{ this.props.translate( 'Disconnect' ) }
				</a>
			);
		}
	}

	toggleSitewideConnection( event ) {
		if ( ! this.state.isSavingSitewide ) {
			const isNowSitewide = event.target.checked;

			this.setState( { isSavingSitewide: true } );
			this.props.onToggleSitewideConnection( this.props.connection, isNowSitewide );
			this.props.recordGoogleEvent( 'Sharing', 'Clicked Connection Available to All Users Checkbox',
				this.props.service.ID, isNowSitewide ? 1 : 0 );
		}
	}

	isConnectionShared() {
		return this.state.isSavingSitewide ? ! this.props.connection.shared : this.props.connection.shared;
	}

	getConnectionKeyringUserLabel() {
		if ( this.props.user && this.props.connectionUser && this.props.user.ID !== this.props.connectionUser.ID ) {
			return (
				<aside className="sharing-connection__keyring-user">
					{ this.props.translate( 'Connected by %(username)s', {
						args: { username: this.props.connectionUser.nice_name },
						context: 'Sharing: connections'
					} ) }
				</aside>
			);
		}
	}

	getConnectionSitewideElement() {
		if ( 'publicize' !== this.props.service.type ) {
			return;
		}

		const userCanUpdate = this.props.site.capabilities && this.props.site.capabilities.edit_others_posts,
			content = [];

		if ( userCanUpdate ) {
			content.push( <input
				key="checkbox"
				type="checkbox"
				checked={ this.isConnectionShared() }
				onChange={ this.toggleSitewideConnection }
				readOnly={ this.state.isSavingSitewide } /> );
		}

		if ( userCanUpdate || this.props.connection.shared ) {
			content.push( <span key="label">
				{ this.props.translate( 'Connection available to all administrators, editors, and authors', {
					context: 'Sharing: Publicize'
				} ) }
			</span> );
		}

		if ( content.length ) {
			return <label className="sharing-connection__account-sitewide-connection">{ content }</label>;
		}
	}

	render() {
		const connectionSitewideElement = this.getConnectionSitewideElement(),
			connectionClasses = classNames( 'sharing-connection', {
				disabled: this.props.isDisconnecting || this.props.isRefreshing
			} ),
			statusClasses = classNames( 'sharing-connection__account-status', {
				'is-shareable': undefined !== connectionSitewideElement
			} );

		return (
			<li className={ connectionClasses }>
				{ this.getProfileImage() }
				<div className={ statusClasses }>
					<span className="sharing-connection__account-name">{ this.props.connection.external_display }</span>
					{ this.getConnectionKeyringUserLabel() }
					{ connectionSitewideElement }
				</div>
				<div className="sharing-connection__account-actions">
					{ this.getReconnectButton() }
					{ this.getDisconnectButton() }
				</div>
			</li>
		);
	}
}

export default connect(
	( state, { connection } ) => ( {
		connectionUser: getUser( state, connection.keyring_connection_user_ID ),
		site: getSelectedSite( state ),
		user: getCurrentUser( state ),
	} ),
	{ recordGoogleEvent },
)( localize( SharingConnection ) );
