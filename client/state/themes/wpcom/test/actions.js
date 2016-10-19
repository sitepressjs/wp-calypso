/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ThemeQueryManager from 'lib/query-manager/theme';
import {
	THEME_DELETE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_EDIT,
	THEME_EDITS_RESET,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEME_RESTORE,
	THEME_RESTORE_FAILURE,
	THEME_RESTORE_SUCCESS,
	THEME_SAVE,
	THEME_SAVE_SUCCESS,
	THEME_SAVE_FAILURE,
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
	editTheme,
	resetThemeEdits,
	saveTheme,
	trashTheme,
	deleteTheme,
	restoreTheme,
	addTermForTheme
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

	describe( '#editTheme()', () => {
		it( 'should return an action object for a new theme', () => {
			const action = editTheme( 2916284, null, {
				title: 'Hello World'
			}, 2916284 );

			expect( action ).to.eql( {
				type: THEME_EDIT,
				siteId: 2916284,
				themeId: null,
				theme: { title: 'Hello World' }
			} );
		} );

		it( 'should return an action object for an existing theme', () => {
			const action = editTheme( 2916284, 413, {
				title: 'Hello World'
			} );

			expect( action ).to.eql( {
				type: THEME_EDIT,
				siteId: 2916284,
				themeId: 413,
				theme: { title: 'Hello World' }
			} );
		} );
	} );

	describe( '#resetThemeEdits()', () => {
		it( 'should return an action object', () => {
			const action = resetThemeEdits( 2916284 );

			expect( action ).to.eql( {
				type: THEME_EDITS_RESET,
				siteId: 2916284,
				themeId: undefined
			} );
		} );
	} );

	describe( 'saveTheme()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.theme( '/rest/v1.2/sites/2916284/themes/new', {
					title: 'Hello World'
				} )
				.reply( 200, {
					ID: 13640,
					title: 'Hello World'
				} )
				.theme( '/rest/v1.2/sites/2916284/themes/13640', {
					title: 'Updated'
				} )
				.reply( 200, {
					ID: 13640,
					title: 'Updated'
				} )
				.theme( '/rest/v1.2/sites/77203074/themes/new' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot edit themes'
				} )
				.theme( '/rest/v1.2/sites/77203074/themes/102' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot edit theme'
				} );
		} );

		it( 'should dispatch save action when thunk triggered for new theme', () => {
			saveTheme( 2916284, null, { title: 'Hello World' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_SAVE,
				siteId: 2916284,
				themeId: null,
				theme: {
					title: 'Hello World'
				}
			} );
		} );

		it( 'should dispatch theme save save success action when request completes for new theme', () => {
			return saveTheme( 2916284, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_SAVE_SUCCESS,
					siteId: 2916284,
					themeId: null,
					theme: { title: 'Hello World' },
					savedTheme: sinon.match( {
						ID: 13640,
						title: 'Hello World'
					} )
				} );
			} );
		} );

		it( 'should dispatch received theme action when request completes for new theme', () => {
			return saveTheme( 2916284, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [
						sinon.match( {
							ID: 13640,
							title: 'Hello World'
						} )
					]
				} );
			} );
		} );

		it( 'should dispatch save action when thunk triggered for existing theme', () => {
			saveTheme( 2916284, 13640, { title: 'Updated' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_SAVE,
				siteId: 2916284,
				themeId: 13640,
				theme: {
					title: 'Updated'
				}
			} );
		} );

		it( 'should dispatch theme save save success action when request completes for existing theme', () => {
			return saveTheme( 2916284, 13640, { title: 'Updated' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_SAVE_SUCCESS,
					siteId: 2916284,
					themeId: 13640,
					theme: { title: 'Updated' },
					savedTheme: sinon.match( {
						ID: 13640,
						title: 'Updated'
					} )
				} );
			} );
		} );

		it( 'should dispatch received theme action when request completes for existing theme', () => {
			return saveTheme( 2916284, 13640, { title: 'Updated' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [
						sinon.match( {
							ID: 13640,
							title: 'Updated'
						} )
					]
				} );
			} );
		} );

		it( 'should dispatch failure action when error occurs while saving new theme', () => {
			return saveTheme( 77203074, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_SAVE_FAILURE,
					siteId: 77203074,
					themeId: null,
					error: sinon.match( { message: 'User cannot edit themes' } )
				} );
			} );
		} );

		it( 'should dispatch failure action when error occurs while saving existing theme', () => {
			return saveTheme( 77203074, 102, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_SAVE_FAILURE,
					siteId: 77203074,
					themeId: 102,
					error: sinon.match( { message: 'User cannot edit theme' } )
				} );
			} );
		} );
	} );

	describe( 'trashTheme()', () => {
		it( 'should dispatch save request with trash status payload', () => {
			trashTheme( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_SAVE,
				siteId: 2916284,
				themeId: 13640,
				theme: {
					status: 'trash'
				}
			} );
		} );
	} );

	describe( 'deleteTheme()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.theme( '/rest/v1.1/sites/2916284/themes/13640/delete' )
				.reply( 200, {
					ID: 13640,
					status: 'deleted'
				} )
				.theme( '/rest/v1.1/sites/77203074/themes/102/delete' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot delete themes'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			deleteTheme( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_DELETE,
				siteId: 2916284,
				themeId: 13640
			} );
		} );

		it( 'should dispatch theme delete request success action when request completes', () => {
			return deleteTheme( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_DELETE_SUCCESS,
					siteId: 2916284,
					themeId: 13640
				} );
			} );
		} );

		it( 'should dispatch theme delete request failure action when request fails', () => {
			return deleteTheme( 77203074, 102 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_DELETE_FAILURE,
					siteId: 77203074,
					themeId: 102,
					error: sinon.match( { message: 'User cannot delete themes' } )
				} );
			} );
		} );
	} );

	describe( 'restoreTheme()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.theme( '/rest/v1.1/sites/2916284/themes/13640/restore' )
				.reply( 200, {
					ID: 13640,
					status: 'draft'
				} )
				.theme( '/rest/v1.1/sites/77203074/themes/102/restore' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot restore trashed themes'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			restoreTheme( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: THEME_RESTORE,
				siteId: 2916284,
				themeId: 13640
			} );
		} );

		it( 'should dispatch the received theme when request completes successfully', () => {
			return restoreTheme( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEMES_RECEIVE,
					themes: [ { ID: 13640, status: 'draft' } ]
				} );
			} );
		} );

		it( 'should dispatch theme restore request success action when request completes', () => {
			return restoreTheme( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_RESTORE_SUCCESS,
					siteId: 2916284,
					themeId: 13640
				} );
			} );
		} );

		it( 'should dispatch theme restore request failure action when request fails', () => {
			return restoreTheme( 77203074, 102 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: THEME_RESTORE_FAILURE,
					siteId: 77203074,
					themeId: 102,
					error: sinon.match( { message: 'User cannot restore trashed themes' } )
				} );
			} );
		} );
	} );

	describe( 'addTermForTheme()', () => {
		const themeObject = {
			ID: 841,
			site_ID: 2916284,
			global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
			title: 'Hello World'
		};
		const getState = () => {
			return {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					},
					edits: {}
				}
			};
		};

		it( 'should dispatch a EDIT_THEME event with the new term', () => {
			addTermForTheme( 2916284, 'jetpack-portfolio', { ID: 123, name: 'ribs' }, 841 )( spy, getState );
			expect( spy ).to.have.been.calledWith( {
				theme: {
					terms: {
						'jetpack-portfolio': [ {
							ID: 123,
							name: 'ribs'
						} ]
					}
				},
				themeId: 841,
				siteId: 2916284,
				type: THEME_EDIT
			} );
		} );

		it( 'should not dispatch anything if no theme', () => {
			addTermForTheme( 2916284, 'jetpack-portfolio', { ID: 123, name: 'ribs' }, 3434 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );

		it( 'should not dispatch anything if no term', () => {
			addTermForTheme( 2916284, 'jetpack-portfolio', null, 841 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );

		it( 'should not dispatch anything if the term is temporary', () => {
			addTermForTheme( 2916284, 'jetpack-portfolio', { id: 'temporary' }, 841 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );
	} );
} );
