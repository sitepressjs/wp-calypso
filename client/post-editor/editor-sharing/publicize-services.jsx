/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { uniq } from 'lodash';

/**
 * Internal dependencies
 */
import EditorSharingPublicizeConnection from './publicize-connection';
import { getCurrentUserId } from 'state/current-user/selectors';

class EditorSharingPublicizeServices extends Component {
	static propTypes = {
		post: PropTypes.object,
		siteId: PropTypes.number.isRequired,
		connections: PropTypes.array.isRequired,
		newConnectionPopup: PropTypes.func.isRequired
	};

	renderServices() {
		const services = uniq( this.props.connections.map( ( connection ) => ( {
			ID: connection.service,
			label: connection.label,
		} ) ), 'ID' );

		return services.map( ( service ) =>
			<li key={ service.ID } className="editor-sharing__publicize-service">
				<h5 className="editor-sharing__publicize-service-heading">{ service.label }</h5>
				{ this.renderConnections( service.ID ) }
			</li>
		);
	}

	renderConnections( serviceName ) {
		// Only include connections of the specified service, filtered by
		// those owned by the current user or shared.
		const connections = this.props.connections.filter( ( connection ) =>
			connection.service === serviceName && ( connection.keyring_connection_user_ID === this.props.userId || connection.shared )
		);

		return connections.map( ( connection ) =>
			<EditorSharingPublicizeConnection
				key={ connection.ID }
				post={ this.props.post }
				connection={ connection }
				onRefresh={ this.props.newConnectionPopup } />
		);
	}

	render() {
		return (
			<ul className="editor-sharing__publicize-services">
				{ this.renderServices() }
			</ul>
		);
	}
}

export default connect(
	( state ) => ( {
		userId: getCurrentUserId( state ),
	} ),
)( EditorSharingPublicizeServices );
