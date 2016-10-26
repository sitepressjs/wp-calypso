/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getCurrentUserTempImage,
	getCurrentUserTempImageExpiration,
	isCurrentUserUploadingGravatar,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isCurrentUserUploadingGravatar', () => {
		it( 'returns false when state is undefined', () => {
			expect( isCurrentUserUploadingGravatar( undefined ) ).to.equal( false );
		} );

		it( 'returns state when defined', () => {
			const uploadingState = {};
			set( uploadingState, 'currentUser.gravatarStatus.isUploading', true );
			expect( isCurrentUserUploadingGravatar( uploadingState ) )
				.to.equal( true );

			const notUploadingState = {};
			set( notUploadingState, 'currentUser.gravatarStatus.isUploading', false );
			expect( isCurrentUserUploadingGravatar( notUploadingState ) )
				.to.equal( false );
		} );
	} );

	describe( '#getCurrentUserTempImage', () => {
		it( 'returns false when no temporary image is stored', () => {
			expect( getCurrentUserTempImage( undefined ) ).to.equal( false );
		} );

		it( 'returns the temporary image', () => {
			const state = {};
			set( state, 'currentUser.gravatarStatus.tempImage.src', 'image' );
			expect( getCurrentUserTempImage( state ) ).to.equal( 'image' );
		} );
	} );

	describe( '#getCurrentUserTempImageExpiration', () => {
		it( 'returns false when no expiration date is stored', () => {
			expect( getCurrentUserTempImageExpiration( undefined ) ).to.equal( false );
		} );

		it( 'returns the date', () => {
			const state = {};
			set( state, 'currentUser.gravatarStatus.tempImage.expiration', 123 );
			expect( getCurrentUserTempImageExpiration( state ) ).to.equal( 123 );
		} );
	} );
} );
