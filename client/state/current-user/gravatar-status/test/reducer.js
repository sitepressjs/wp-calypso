/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_REMOVE_TEMPORARY,
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	isUploading,
	tempImage
} from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	it( 'exports expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'isUploading',
			'tempImage'
		] );
	} );

	describe( '#isUploading', () => {
		it( 'returns false by default', () => {
			const state = isUploading( undefined, {} );
			expect( state ).to.equal( false );
		} );

		it( 'returns true when request is made', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST
			} ) ).to.equal( true );
		} );

		it( 'returns false when request succeeds', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST_SUCCESS
			} ) ).to.equal( false );
		} );

		it( 'returns false when request fails', () => {
			expect( isUploading( undefined, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );

			expect( isUploading( false, {
				type: GRAVATAR_UPLOAD_REQUEST_FAILURE
			} ) ).to.equal( false );
		} );

		it( 'never persists loading state', () => {
			expect( isUploading( true, {
				type: SERIALIZE
			} ) ).to.equal( false );

			expect( isUploading( true, {
				type: DESERIALIZE
			} ) ).to.equal( false );
		} );
	} );

	describe( '#tempImage', () => {
		let sandbox;
		useSandbox( newSandbox => {
			sandbox = newSandbox;
			sandbox.stub( console, 'warn' );
		} );

		it( 'returns empty object by default', () => {
			const state = tempImage( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'returns expiration date and temp image src when response is received', () => {
			const state = tempImage( undefined, {
				type: GRAVATAR_UPLOAD_RECEIVE,
				expiration: 123,
				src: 'imageString'
			} );
			expect( state ).to.eql( {
				expiration: 123,
				src: 'imageString'
			} );
		} );

		it( 'returns empty state when remove action is received', () => {
			const originalState = {
				expiration: 123,
				tempImage: 'imageString'
			};
			const newState = tempImage( originalState, {
				type: GRAVATAR_REMOVE_TEMPORARY,
			} );
			expect( newState ).to.eql( {} );
		} );

		it( 'persists state', () => {
			const original = {
				expiration: 123,
				src: 'imageString'
			};
			const state = tempImage( original, { type: SERIALIZE } );
			expect( state ).to.eql( original );
		} );

		it( 'loads persisted state', () => {
			const original = {
				expiration: 123,
				src: 'imageString'
			};
			const state = tempImage( original, { type: DESERIALIZE } );
			expect( state ).to.eql( original );
		} );

		it( 'loads default state when schema is incorrect', () => {
			const original = {
				expiration: '123',
				src: 42
			};
			const state = tempImage( original, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );
} );
