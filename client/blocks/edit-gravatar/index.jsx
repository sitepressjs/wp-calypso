/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FilePicker from 'components/file-picker';
import FormLabel from 'components/forms/form-label';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	isCurrentUserUploadingGravatar,
} from 'state/current-user/gravatar-status/selectors';
import Gravatar from 'components/gravatar';
import { isOffline } from 'state/application/selectors';
import { localize } from 'i18n-calypso';
import Spinner from 'components/spinner';
import { getToken as getOauthToken } from 'lib/oauth-token';
import { uploadGravatar } from 'state/current-user/gravatar-status/actions';
import ImageEditor from 'blocks/image-editor';

export class EditGravatar extends Component {
	constructor() {
		super( ...arguments );
		this.onReceiveFile = this.onReceiveFile.bind( this );
		this.onImageEditorDone = this.onImageEditorDone.bind( this );
		this.hideImageEditor = this.hideImageEditor.bind( this );
		this.state = { isEditingImage: false, file: false };
	}

	static propTypes = {
		isOffline: PropTypes.bool,
		translate: PropTypes.func,
		user: PropTypes.object,
		isUploading: PropTypes.bool,
	};

	onReceiveFile( files ) {
		console.log( 'you picked', JSON.stringify( files[ 0 ].name ) );
		const imageObjectUrl = window.URL.createObjectURL( files[ 0 ] );
		this.setState( {
			isEditingImage: true,
			file: imageObjectUrl
		} );
	}

	onImageEditorDone( error, imageBlob ) {
		const { user } = this.props;
		this.hideImageEditor();

		// check for bearerToken from desktop app
		let bearerToken = getOauthToken();
		if ( ! bearerToken ) {
			bearerToken = localStorage.getItem( 'bearerToken' );
		}

		// send gravatar request
		if ( bearerToken ) {
			console.log( 'Got the bearerToken, sending request' );
			this.props.uploadGravatar( imageBlob, bearerToken, user.email, user.ID );
		} else {
			console.log( 'Oops - no bearer token.' );
		}
	}

	hideImageEditor() {
		this.setState( {
			isEditingImage: false,
			file: false
		} );
	}

	renderImageEditor() {
		if ( this.state.isEditingImage ) {
			return (
				<ImageEditor
					media={ { src: this.state.file } }
					onDone={ this.onImageEditorDone }
					onCancel={ this.hideImageEditor }
				/>
			);
		}
	}

	render() {
		const { isOffline: userIsOffline,
			translate, user, isUploading } = this.props;
		return (
			<div>
				<FormLabel>
					{ translate( 'Avatar', {
						comment: 'A section heading on the profile page.'
					}
					) }
				</FormLabel>
				<div
					className={ classnames( 'edit-gravatar__image-container',
						{ 'is-uploading': isUploading }
					) }
				>
					<Gravatar
						imgSize={ 270 }
						size={ 100 }
						user={ user }
					/>
					{ isUploading && <Spinner className="edit-gravatar__spinner" /> }
				</div>
				<p>
					{ translate( 'To change, select an image or ' +
					'drag and drop a picture from your computer.' ) }
				</p>
				<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
					<Button
						disabled={ userIsOffline || isUploading || ! user.email_verified }
					>
						{ translate( 'Select Image' ) }
					</Button>
				</FilePicker>
				{ this.renderImageEditor() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		user: getCurrentUser( state ),
		isOffline: isOffline( state ),
		isUploading: isCurrentUserUploadingGravatar( state ),
	} ),
	{ uploadGravatar }
)( localize( EditGravatar ) );
