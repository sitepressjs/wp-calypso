/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GRAVATAR_UPLOAD_RECEIVE,
	USER_RECEIVE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index users by ID', () => {
			const state = items( null, {
				type: USER_RECEIVE,
				user: { ID: 73705554, login: 'testonesite2014' }
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testonesite2014' }
			} );
		} );

		it( 'should accumulate users', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' }
			} );
			const state = items( original, {
				type: USER_RECEIVE,
				user: { ID: 73705672, login: 'testtwosites2014' }
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testonesite2014' },
				73705672: { ID: 73705672, login: 'testtwosites2014' }
			} );
		} );

		it( 'should override previous user of same ID', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, login: 'testonesite2014' }
			} );
			const state = items( original, {
				type: USER_RECEIVE,
				user: { ID: 73705554, login: 'testtwosites2014' }
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, login: 'testtwosites2014' }
			} );
		} );

		it( 'should update Gravatar URL when new Gravatar is uploaded', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, avatar_URL: 'https://www.example.com' },
				73705672: { ID: 73705672, avatar_URL: 'https://www.73705672.com' }
			} );
			const state = items( original, {
				type: GRAVATAR_UPLOAD_RECEIVE,
				expiration: 1,
				src: 'tempImageSrc',
				userId: 73705554
			} );

			expect( state ).to.eql( {
				73705554: { ID: 73705554, avatar_URL: 'https://www.example.com/?v=1' },
				73705672: { ID: 73705672, avatar_URL: 'https://www.73705672.com' }
			} );
		} );

		it( 'should leave the state unchanged if user object not found or is incorrect', () => {
			const original = Object.freeze( {
				73705554: { ID: 73705554, avatar_URL: 'https://www.example.com' }
			} );
			const state = items( original, {
				type: GRAVATAR_UPLOAD_RECEIVE,
				expiration: 1,
				src: 'tempImageSrc',
				userId: 1
			} );
			expect( state ).to.eql( original );
		} );

		describe( 'persistence', () => {
			it( 'does not persist state because this is not implemented yet', () => {
				const state = Object.freeze( {
					73705554: {
						ID: 73705554,
						display_name: 'Test User',
						username: 'testuser',
						avatar_URL: 'https://www.example.com',
						site_count: 11,
						visible_site_count: 5,
						date: '2015-09-07T19:42:30+00:00',
						has_unseen_notes: false,
						newest_note_type: 'like',
						phone_account: false,
						email: 'test@example.com',
						email_verified: true,
						is_valid_google_apps_country: true,
						logout_URL: 'https://www.example.com',
						primary_blog_url: 'https://www.example.com',
						meta: { links: {}, data: {} },
						primarySiteSlug: 'www.example.com',
						localeSlug: 'en',
						isRTL: false
					}
				} );
				const persistedState = items( state, { type: SERIALIZE } );
				expect( persistedState ).to.eql( {} );
			} );

			it( 'does not load persisted state because this is not implemented yet', () => {
				const persistedState = Object.freeze( {
					73705554: {
						ID: 73705554,
						display_name: 'Test User',
						username: 'testuser',
						avatar_URL: 'https://www.example.com',
						site_count: 11,
						visible_site_count: 5,
						date: '2015-09-07T19:42:30+00:00',
						has_unseen_notes: false,
						newest_note_type: 'like',
						phone_account: false,
						email: 'test@example.com',
						email_verified: true,
						is_valid_google_apps_country: true,
						logout_URL: 'https://www.example.com',
						primary_blog_url: 'https://www.example.com',
						meta: { links: {}, data: {} },
						primarySiteSlug: 'www.example.com',
						localeSlug: 'en',
						isRTL: false
					}
				} );
				const state = items( persistedState, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );
} );
