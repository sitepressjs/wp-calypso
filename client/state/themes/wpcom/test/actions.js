/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE
} from 'state/action-types';
import {
	receiveTheme,
	receiveThemes,
	requestSiteThemes,
	requestSiteTheme,
	requestThemes,
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveTheme()', () => {
		it( 'should return an action object', () => {
			const theme = { ID: 841, title: 'Hello World' };
			const action = receiveTheme( theme );

			expect( action ).to.eql( {
				type: THEMES_RECEIVE,
				themes: [ theme ]
			} );
		} );
	} );

	describe( '#receiveThemes()', () => {
		it( 'should return an action object', () => {
			const themes = [ { ID: 841, title: 'Hello World' } ];
			const action = receiveThemes( themes );

			expect( action ).to.eql( {
				type: THEMES_RECEIVE,
				themes
			} );
		} );
	} );

	describe( '#requestThemes()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/themes' )
				.reply( 200, {
					found: 2,
					themes: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} )
				.get( '/rest/v1.1/sites/2916284/themes' )
				.query( { search: 'Hello' } )
				.reply( 200, {
					found: 1,
					themes: [ { ID: 841, title: 'Hello World' } ]
				} )
				.get( '/rest/v1.1/sites/77203074/themes' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSiteThemes( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEMES_REQUEST,
				siteId: 2916284,
				query: {}
			} );
		} );

		it( 'should dispatch themes receive action when request completes', () => {
			return requestSiteThemes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );

		it( 'should dispatch themes themes request success action when request completes', () => {
			return requestSiteThemes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: {},
					found: 2,
					themes: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );

		it( 'should dispatch themes request success action with query results', () => {
			return requestSiteThemes( 2916284, { search: 'Hello' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					themes: [
						{ ID: 841, title: 'Hello World' }
					]
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSiteThemes( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_REQUEST_FAILURE,
					siteId: 77203074,
					query: {},
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );

	describe( '#requestThemes()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/themes' )
				.reply( 200, {
					found: 2,
					themes: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
		} );

		it( 'should dispatch themes receive action when request completes', () => {
			return requestThemes()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );
	} );

	describe( '#requestSiteTheme()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/themes/413' )
				.reply( 200, { ID: 413, title: 'Ribs & Chicken' } )
				.get( '/rest/v1.1/sites/2916284/themes/420' )
				.reply( 404, {
					error: 'unknown_theme',
					message: 'Unknown theme'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			requestSiteTheme( 2916284, 413 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_REQUEST,
				siteId: 2916284,
				themeId: 413
			} );
		} );

		it( 'should dispatch themes receive action when request completes', () => {
			return requestSiteTheme( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [
						sinon.match( { ID: 413, title: 'Ribs & Chicken' } )
					]
				} );
			} );
		} );

		it( 'should dispatch themes themes request success action when request completes', () => {
			return requestSiteTheme( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST_SUCCESS,
					siteId: 2916284,
					themeId: 413
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSiteTheme( 2916284, 420 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_REQUEST_FAILURE,
					siteId: 2916284,
					themeId: 420,
					error: sinon.match( { message: 'Unknown theme' } )
				} );
			} );
		} );
	} );
} );
