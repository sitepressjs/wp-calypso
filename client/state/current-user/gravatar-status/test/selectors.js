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
			const state = {};
			set( state, 'currentUser.gravatarStatus.isUploading', true );
			expect( isCurrentUserUploadingGravatar( state ) ).to.equal( true );
			set( state, 'currentUser.gravatarStatus.isUploading', false );
			expect( isCurrentUserUploadingGravatar( state ) ).to.equal( false );
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
