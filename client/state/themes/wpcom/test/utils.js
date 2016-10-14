/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	normalizeThemeForDisplay,
	normalizeThemeForState,
	normalizeThemeForApi,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getDeserializedThemesQueryDetails,
	getSerializedThemesQueryWithoutPage,
	getTermIdsFromEdits,
	mergeIgnoringArrays
} from '../utils';

describe( 'utils', () => {
	describe( 'normalizeThemeForApi()', () => {
		it( 'should return null if theme is falsey', () => {
			const normalizedTheme = normalizeThemeForApi();
			expect( normalizedTheme ).to.be.null;
		} );

		it( 'should return a normalized theme object', () => {
			const theme = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					category: [ { ID: 777, name: 'recipes' } ],
					theme_tag: [ 'super', 'yummy', 'stuff' ]
				}
			};

			const normalizedTheme = normalizeThemeForApi( theme );
			expect( normalizedTheme ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					theme_tag: [ 'super', 'yummy', 'stuff' ]
				}
			} );
		} );
	} );

	describe( 'normalizeThemeForDisplay()', () => {
		it( 'should return null if theme is falsey', () => {
			const normalizedTheme = normalizeThemeForDisplay();
			expect( normalizedTheme ).to.be.null;
		} );

		it( 'should return a normalized theme object', () => {
			const theme = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				author: {
					name: 'Badman <img onerror= />'
				},
				featured_image: 'https://example.com/logo.png'
			};

			const normalizedTheme = normalizeThemeForDisplay( theme );
			expect( normalizedTheme ).to.eql( {
				...theme,
				title: 'Ribs & Chicken',
				author: {
					name: 'Badman '
				},
				canonical_image: {
					type: 'image',
					uri: 'https://example.com/logo.png'
				}
			} );
		} );
	} );

	describe( 'normalizeThemeForState()', () => {
		it( 'should deeply unset all meta', () => {
			const original = deepFreeze( {
				ID: 814,
				meta: {},
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {}
						}
					},
					theme_tag: {
						meta: {
							ID: 171,
							name: 'meta',
							meta: {}
						}
					}
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {}
					}
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta',
						meta: {}
					}
				},
				attachments: {
					14209: {
						ID: 14209,
						meta: {}
					}
				}
			} );
			const revised = normalizeThemeForState( original );

			expect( revised ).to.not.equal( original );
			expect( revised ).to.eql( {
				ID: 814,
				terms: {
					category: {
						meta: {
							ID: 171,
							name: 'meta'
						}
					},
					theme_tag: {
						meta: {
							ID: 171,
							name: 'meta'
						}
					}
				},
				categories: {
					meta: {
						ID: 171,
						name: 'meta'
					}
				},
				tags: {
					meta: {
						ID: 171,
						name: 'meta'
					}
				},
				attachments: {
					14209: {
						ID: 14209
					}
				}
			} );
		} );
	} );

	describe( '#getNormalizedThemesQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedThemesQuery( {
				page: 4,
				number: 20
			} );

			expect( query ).to.eql( {
				page: 4
			} );
		} );
	} );

	describe( '#getSerializedThemesQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedThemesQuery( {
				type: 'page',
				page: 1
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQuery( {
				search: 'Hello'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedThemesQueryDetails()', () => {
		it( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( 'bad' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: undefined
			} );
		} );

		it( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: { search: 'hello' }
			} );
		} );

		it( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: 2916284,
				query: { search: 'hello' }
			} );
		} );
	} );

	describe( '#getSerializedThemesQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage( {
				type: 'page',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage( {
				search: 'Hello',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'mergeIgnoringArrays()', () => {
		it( 'should merge into an empty object', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should not modify array properties in the original object', () => {
			const merged = mergeIgnoringArrays( {
				tags_by_id: [ 4, 5, 6 ]
			}, {} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 5, 6 ]
			} );
		} );

		it( 'should allow removing array items', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 4, 6 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 4, 6 ]
			} );
		} );

		it( 'should replace arrays with the new value', () => {
			const merged = mergeIgnoringArrays( {}, {
				tags_by_id: [ 4, 5, 6 ]
			}, {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );

			expect( merged ).to.eql( {
				tags_by_id: [ 1, 2, 3, 4 ]
			} );
		} );
	} );

	describe( '#getTermIdsFromEdits()', () => {
		it( 'should return the same theme edit object if no term edits have been made', () => {
			const normalizedThemeEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves'
			} );

			expect( normalizedThemeEdits ).to.eql( {
				title: 'Chewbacca Saves'
			} );
		} );

		it( 'should return the add terms_by_id if terms have been edited', () => {
			const originalTheme = deepFreeze( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce'
						}
					}
				}
			} );

			const normalizedThemeEdits = getTermIdsFromEdits( originalTheme );

			expect( normalizedThemeEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_types: {
						awesomesauce: {
							ID: 777,
							name: 'Awesomesauce'
						}
					}
				},
				terms_by_id: {
					wookie_theme_types: [ 777 ]
				}
			} );
		} );

		it( 'should taxonomy terms_by_id to null if object is empty', () => {
			const normalizedThemeEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_types: {}
				}
			} );

			expect( normalizedThemeEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_types: {}
				},
				terms_by_id: {
					wookie_theme_types: null
				}
			} );
		} );

		it( 'should not set terms_by_id for taxonomies that set an array on terms', () => {
			const normalizedThemeEdits = getTermIdsFromEdits( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_tags: [ 'raaar', 'uggggaaarr' ]
				}
			} );

			expect( normalizedThemeEdits ).to.eql( {
				title: 'Chewbacca Saves',
				terms: {
					wookie_theme_tags: [ 'raaar', 'uggggaaarr' ]
				}
			} );
		} );
	} );
} );
