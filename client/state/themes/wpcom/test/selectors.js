/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getTheme,
	getNormalizedTheme,
	getSiteThemes,
	getSiteTheme,
	getSiteThemesForQuery,
	isThemePublished,
	isRequestingSiteThemesForQuery,
	getSiteThemesFoundForQuery,
	getSiteThemesLastPageForQuery,
	isSiteThemesLastPageForQuery,
	getSiteThemesForQueryIgnoringPage,
	isRequestingSiteThemesForQueryIgnoringPage,
	getEditedTheme,
	getThemeEdits,
	getEditedThemeValue,
	getEditedThemeSlug,
	isEditedThemeDirty,
	getThemePreviewUrl
} from '../selectors';
import ThemeQueryManager from 'lib/query-manager/theme';

describe( 'selectors', () => {
	beforeEach( () => {
		getSiteThemes.memoizedSelector.cache.clear();
		getSiteTheme.memoizedSelector.cache.clear();
		getSiteThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		isRequestingSiteThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		getNormalizedTheme.memoizedSelector.cache.clear();
		getSiteThemesForQuery.memoizedSelector.cache.clear();
		getSiteThemesForQueryIgnoringPage.memoizedSelector.cache.clear();
		isThemePublished.memoizedSelector.cache.clear();
	} );

	describe( '#getTheme()', () => {
		it( 'should return null if the global ID is not tracked', () => {
			const theme = getTheme( {
				themes: {
					items: {},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( theme ).to.be.null;
		} );

		it( 'should return null if there is no manager associated with the path site', () => {
			const theme = getTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( theme ).to.be.null;
		} );

		it( 'should return the object for the theme global ID', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken'
			};
			const theme = getTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( theme ).to.equal( themeObject );
		} );
	} );

	describe( 'getNormalizedTheme()', () => {
		it( 'should return null if the theme is not tracked', () => {
			const normalizedTheme = getNormalizedTheme( {
				themes: {
					items: {},
					queries: {}
				}
			}, '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( normalizedTheme ).to.be.null;
		} );

		it( 'should return a normalized copy of the theme', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				author: {
					name: 'Badman <img onerror= />'
				},
				featured_image: 'https://example.com/logo.png'
			};

			const normalizedTheme = getNormalizedTheme( deepFreeze( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					}
				}
			} ), '3d097cb7c5473c169bba0eb8e3c6cb64' );

			expect( normalizedTheme ).to.not.equal( themeObject );
			expect( normalizedTheme ).to.eql( {
				...themeObject,
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

	describe( '#getSiteThemes()', () => {
		it( 'should return an array of theme objects for the site', () => {
			const themeObjects = {
				2916284: {
					'3d097cb7c5473c169bba0eb8e3c6cb64': {
						ID: 841,
						site_ID: 2916284,
						global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
						title: 'Hello World'
					},
					'6c831c187ffef321eb43a67761a525a3': {
						ID: 413,
						site_ID: 2916284,
						global_ID: '6c831c187ffef321eb43a67761a525a3',
						title: 'Ribs &amp; Chicken'
					}
				},
				77203074: {
					'0fcb4eb16f493c19b627438fdc18d57c': {
						ID: 120,
						site_ID: 77203074,
						global_ID: 'f0cb4eb16f493c19b627438fdc18d57c',
						title: 'Steak &amp; Eggs'
					}
				}
			};
			const state = {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: themeObjects[ 2916284 ]
						} ),
						77203074: new ThemeQueryManager( {
							items: themeObjects[ 77203074 ]
						} )
					},

				}
			};

			expect( getSiteThemes( state, 2916284 ) ).to.have.members( values( themeObjects[ 2916284 ] ) );
		} );
	} );

	describe( '#getSiteTheme()', () => {
		it( 'should return null if the theme is not known for the site', () => {
			const theme = getSiteTheme( {
				themes: {
					queries: {}
				}
			}, 2916284, 413 );

			expect( theme ).to.be.null;
		} );

		it( 'should return the object for the theme site ID, theme ID pair', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const theme = getSiteTheme( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					}
				}
			}, 2916284, 841 );

			expect( theme ).to.equal( themeObject );
		} );
	} );

	describe( '#getSiteThemesForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const siteThemes = getSiteThemesForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return null if the query is not tracked to the query manager', () => {
			const siteThemes = getSiteThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return an array of normalized known queried themes', () => {
			const siteThemes = getSiteThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Ribs &amp; Chicken'
								}
							},
							queries: {
								'[["search","Ribs"]]': {
									itemKeys: [ 841 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Ribs' } );

			expect( siteThemes ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			] );
		} );

		it( 'should return null if we know the number of found items but the requested set hasn\'t been received', () => {
			const siteThemes = getSiteThemesForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								1204: {
									ID: 1204,
									site_ID: 2916284,
									global_ID: '48b6010b559efe6a77a429773e0cbf12',
									title: 'Sweet &amp; Savory'
								}
							},
							queries: {
								'[["search","Sweet"]]': {
									itemKeys: [ 1204, undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sweet', number: 1, page: 2 } );

			expect( siteThemes ).to.be.null;
		} );
	} );

	describe( '#isRequestingSiteThemesForQuery()', () => {
		it( 'should return false if the site has not been queried', () => {
			const isRequesting = isRequestingSiteThemesForQuery( {
				themes: {
					queryRequests: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site has not been queried for the specific query', () => {
			const isRequesting = isRequestingSiteThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Hel"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site has been queried for the specific query', () => {
			const isRequesting = isRequestingSiteThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Hello"}': true
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return false if the site has previously, but is not currently, querying for the specified query', () => {
			const isRequesting = isRequestingSiteThemesForQuery( {
				themes: {
					queryRequests: {
						'2916284:{"search":"Hello"}': false
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'getSiteThemesFoundForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const found = getSiteThemesFoundForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.be.null;
		} );

		it( 'should return the found items for a site query', () => {
			const found = getSiteThemesFoundForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.equal( 1 );
		} );

		it( 'should return zero if in-fact there are zero items', () => {
			const found = getSiteThemesFoundForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [],
									found: 0
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( found ).to.equal( 0 );
		} );
	} );

	describe( '#getSiteThemesLastPageForQuery()', () => {
		it( 'should return null if the site query is not tracked', () => {
			const lastPage = getSiteThemesLastPageForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.be.null;
		} );

		it( 'should return the last page value for a site query', () => {
			const lastPage = getSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.equal( 1 );
		} );

		it( 'should return the last page value for a site query, even if including page param', () => {
			const lastPage = getSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 3, number: 1 } );

			expect( lastPage ).to.equal( 4 );
		} );

		it( 'should return 1 if there are no found themes', () => {
			const lastPage = getSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [],
									found: 0
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello' } );

			expect( lastPage ).to.equal( 1 );
		} );
	} );

	describe( '#isSiteThemesLastPageForQuery()', () => {
		it( 'should return null if the last page is not known', () => {
			const isLastPage = isSiteThemesLastPageForQuery( {
				themes: {
					queries: {}
				}
			}, 2916284, { search: 'Hello' } );

			expect( isLastPage ).to.be.null;
		} );

		it( 'should return false if the query explicit value is not the last page', () => {
			const isLastPage = isSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 3, number: 1 } );

			expect( isLastPage ).to.be.false;
		} );

		it( 'should return true if the query explicit value is the last page', () => {
			const isLastPage = isSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 4
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', page: 4, number: 1 } );

			expect( isLastPage ).to.be.true;
		} );

		it( 'should return true if the query implicit value is the last page', () => {
			const isLastPage = isSiteThemesLastPageForQuery( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
							},
							queries: {
								'[["search","Hello"]]': {
									itemKeys: [ 841 ],
									found: 1
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Hello', number: 1 } );

			expect( isLastPage ).to.be.true;
		} );
	} );

	describe( '#getSiteThemesForQueryIgnoringPage()', () => {
		it( 'should return null if the query is not tracked', () => {
			const siteThemes = getSiteThemesForQueryIgnoringPage( {
				themes: {
					items: {},
					queries: {}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return null if the query manager has not received items for query', () => {
			const siteThemes = getSiteThemesForQueryIgnoringPage( {
				themes: {
					items: {},
					queries: {
						2916284: new ThemeQueryManager( {
							items: {},
							queries: {}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( siteThemes ).to.be.null;
		} );

		it( 'should return a concatenated array of all site themes ignoring page', () => {
			const siteThemes = getSiteThemesForQueryIgnoringPage( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
						'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' }
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
								413: { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs &amp; Chicken' }
							},
							queries: {
								'[]': {
									itemKeys: [ 841, 413 ]
								}
							}
						} )
					}
				}
			}, 2916284, { search: '', number: 1 } );

			expect( siteThemes ).to.eql( [
				{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			] );
		} );

		it( 'should omit found items for which the requested result hasn\'t been received', () => {
			const siteThemes = getSiteThemesForQueryIgnoringPage( {
				themes: {
					items: {
						'48b6010b559efe6a77a429773e0cbf12': { ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet &amp; Savory' }
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								1204: { ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet &amp; Savory' }
							},
							queries: {
								'[["search","Sweet"]]': {
									itemKeys: [ 1204, undefined ],
									found: 2
								}
							}
						} )
					}
				}
			}, 2916284, { search: 'Sweet', number: 1 } );

			expect( siteThemes ).to.eql( [
				{ ID: 1204, site_ID: 2916284, global_ID: '48b6010b559efe6a77a429773e0cbf12', title: 'Sweet & Savory' }
			] );
		} );
	} );

	describe( 'isRequestingSiteThemesForQueryIgnoringPage()', () => {
		it( 'should return false if not requesting for query', () => {
			const isRequesting = isRequestingSiteThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {}
				}
			}, 2916284, { search: 'hel' } );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true requesting for query at exact page', () => {
			const isRequesting = isRequestingSiteThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {
						'2916284:{"search":"hel","page":4}': true
					}
				}
			}, 2916284, { search: 'hel', page: 4 } );

			expect( isRequesting ).to.be.true;
		} );

		it( 'should return true requesting for query without page specified', () => {
			const isRequesting = isRequestingSiteThemesForQueryIgnoringPage( {
				themes: {
					queryRequests: {
						'2916284:{"search":"hel","page":4}': true
					}
				}
			}, 2916284, { search: 'hel' } );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getEditedTheme()', () => {
		it( 'should return the original theme if no revisions exist on site', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedTheme = getEditedTheme( {
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
			}, 2916284, 841 );

			expect( editedTheme ).to.equal( themeObject );
		} );

		it( 'should return revisions for a new draft', () => {
			const editedTheme = getEditedTheme( {
				themes: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							'': {
								title: 'Ribs &amp; Chicken'
							}
						}
					}
				}
			}, 2916284 );

			expect( editedTheme ).to.eql( { title: 'Ribs &amp; Chicken' } );
		} );

		it( 'should return revisions for a draft if the original is unknown', () => {
			const editedTheme = getEditedTheme( {
				themes: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedTheme ).to.eql( { title: 'Hello World!' } );
		} );

		it( 'should return revisions merged with the original theme', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedTheme = getEditedTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedTheme ).to.eql( {
				...themeObject,
				title: 'Hello World!'
			} );
		} );

		it( 'should return revisions merged with original theme nested properties', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true
				}
			};
			const editedTheme = getEditedTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					},
					edits: {
						2916284: {
							841: {
								discussion: {
									pings_open: true
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedTheme ).to.eql( {
				...themeObject,
				discussion: {
					comments_open: true,
					pings_open: true
				}
			} );
		} );

		it( 'should return revisions with array properties overwriting objects', () => {
			// This tests the initial edit of a non-hierarchical taxonomy
			// TODO avoid changing the shape of the `terms` state - see:
			// https://github.com/Automattic/wp-calypso/pull/6548#issuecomment-233148766
			const editedTheme = getEditedTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									terms: {
										theme_tag: {
											tag1: { ID: 1 },
											tag2: { ID: 2 }
										},
										category: {
											category3: { ID: 3 },
											category4: { ID: 4 }
										}
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								terms: {
									theme_tag: [ 'tag2', 'tag3' ]
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedTheme ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					theme_tag: [ 'tag2', 'tag3' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 }
					}
				}
			} );
		} );

		it( 'should return revisions with array properties overwriting previous versions', () => {
			// This tests removal of a term from a non-hierarchical taxonomy
			const editedTheme = getEditedTheme( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									terms: {
										theme_tag: [ 'tag1', 'tag2' ],
										category: {
											category3: { ID: 3 },
											category4: { ID: 4 }
										}
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								terms: {
									theme_tag: [ 'tag1' ]
								}
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedTheme ).to.eql( {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				terms: {
					theme_tag: [ 'tag1' ],
					category: {
						category3: { ID: 3 },
						category4: { ID: 4 }
					}
				}
			} );
		} );
	} );

	describe( 'getThemeEdits()', () => {
		it( 'should return null if no edits exist for a new theme', () => {
			const themeEdits = getThemeEdits( {
				themes: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284 );

			expect( themeEdits ).to.be.null;
		} );

		it( 'should return null if no edits exist for an existing theme', () => {
			const themeEdits = getThemeEdits( {
				themes: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284, 841 );

			expect( themeEdits ).to.be.null;
		} );

		it( 'should return the edited attributes for a new theme', () => {
			const themeEdits = getThemeEdits( {
				themes: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							'': {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284 );

			expect( themeEdits ).to.eql( {
				title: 'Hello World!'
			} );
		} );

		it( 'should return the edited attributes for an existing theme', () => {
			const themeEdits = getThemeEdits( {
				themes: {
					items: {},
					queries: {},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( themeEdits ).to.eql( {
				title: 'Hello World!'
			} );
		} );
	} );

	describe( 'getEditedThemeValue()', () => {
		it( 'should return undefined if the theme does not exist', () => {
			const editedThemeValue = getEditedThemeValue( {
				themes: {
					items: {},
					queries: {},
					edits: {}
				}
			}, 2916284, 841, 'title' );

			expect( editedThemeValue ).to.be.undefined;
		} );

		it( 'should return the assigned theme value', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Hello World'
			};
			const editedThemeValue = getEditedThemeValue( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841, 'title' );

			expect( editedThemeValue ).to.equal( 'Hello World!' );
		} );

		it( 'should return the assigned nested theme value', () => {
			const themeObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				discussion: {
					comments_open: true
				}
			};
			const editedThemeValue = getEditedThemeValue( {
				themes: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new ThemeQueryManager( {
							items: { 841: themeObject }
						} )
					},
					edits: {
						2916284: {
							841: {
								discussion: {
									pings_open: true
								}
							}
						}
					}
				}
			}, 2916284, 841, 'discussion.pings_open' );

			expect( editedThemeValue ).to.be.true;
		} );
	} );

	describe( 'isEditedThemeDirty()', () => {
		beforeEach( () => {
			isEditedThemeDirty.memoizedSelector.cache.clear();
		} );

		it( 'should return false if there are no edits for the theme', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64'
								}
							}
						} )
					},
					edits: {}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if edited with a type', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									type: 'theme'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								type: 'theme'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if newly edited with custom type', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {},
					edits: {
						2916284: {
							'': {
								type: 'jetpack-portfolio'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return false if no saved theme and value matches default for new theme', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {},
					edits: {
						2916284: {
							'': {
								status: 'draft'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return true if no saved theme and value does not match default for new theme', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {},
					edits: {
						2916284: {
							'': {
								status: 'publish'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.true;
		} );

		it( 'should return true if no saved theme and no default exists for key', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {},
					edits: {
						2916284: {
							'': {
								author: 'testonesite2014'
							}
						}
					}
				}
			}, 2916284 );

			expect( isDirty ).to.be.true;
		} );

		it( 'should return false if saved theme value equals edited theme value', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.false;
		} );

		it( 'should return true if saved theme value does not equal edited theme value', () => {
			const isDirty = isEditedThemeDirty( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									title: 'Hello World'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( isDirty ).to.be.true;
		} );
	} );

	describe( 'getThemePreviewUrl()', () => {
		it( 'should return null if the theme is not known', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should return null if the theme has no URL', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should return null if the theme is trashed', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									URL: 'http://example.com/theme-url',
									status: 'trash'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.be.null;
		} );

		it( 'should prefer the theme preview URL if available', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									URL: 'http://example.com/theme-url',
									preview_URL: 'https://example.com/preview-url'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/preview-url' );
		} );

		it( 'should use theme URL if preview URL not available', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									URL: 'https://example.com/theme-url'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/theme-url' );
		} );

		it( 'should append preview query argument to non-published themes', () => {
			const previewUrl = getThemePreviewUrl( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									URL: 'https://example.com/theme-url?other_arg=1'
								}
							}
						} )
					}
				},
				sites: {
					items: {}
				}
			}, 2916284, 841 );

			expect( previewUrl ).to.equal( 'https://example.com/theme-url?other_arg=1&preview=true' );
		} );
	} );

	describe( 'isThemePublished()', () => {
		it( 'should return null if the theme is not known', () => {
			const isPublished = isThemePublished( {
				themes: {
					queries: {}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.null;
		} );

		it( 'should return true if the theme status is publish', () => {
			const isPublished = isThemePublished( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );

		it( 'should return true if the theme status is private', () => {
			const isPublished = isThemePublished( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );

		it( 'should return false if the theme status is draft', () => {
			const isPublished = isThemePublished( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft'
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.false;
		} );

		it( 'should return false if the theme status is future and date is in future', () => {
			const tenMinutes = 1000 * 60;
			const themeDate = Date.now() + tenMinutes;
			const isPublished = isThemePublished( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'future',
									date: themeDate
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.false;
		} );

		it( 'should return true if the theme status is future and date is in past', () => {
			const tenMinutes = 1000 * 60;
			const themeDate = Date.now() - tenMinutes;
			const isPublished = isThemePublished( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'future',
									date: themeDate
								}
							}
						} )
					}
				}
			}, 2916284, 841 );

			expect( isPublished ).to.be.true;
		} );
	} );

	describe( 'getEditedThemeSlug()', () => {
		it( 'should return undefined if the theme is not known', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {}
				}
			}, 2916284, 841 );

			expect( slug ).to.be.undefined;
		} );

		it( 'should return theme.slug if theme is published', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'publish',
									slug: 'chewbacca'
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'chewbacca' );
		} );

		it( 'should return edited slug if theme is not published', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									slug: 'chewbacca',
									other_URLs: {
										suggested_slug: 'chewbacca'
									}
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: 'jedi'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'jedi' );
		} );

		it( 'should return suggested-slug if theme is not published', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									other_URLs: {
										suggested_slug: 'chewbacca'
									}
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'chewbacca' );
		} );

		it( 'should return slug if theme is not published and slug is set', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'draft',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'jedi' );
		} );

		it( 'should return edited slug if theme is published', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: 'ewok'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( 'ewok' );
		} );

		it( 'should return an empty edited slug if theme is published', () => {
			const slug = getEditedThemeSlug( {
				themes: {
					queries: {
						2916284: new ThemeQueryManager( {
							items: {
								841: {
									ID: 841,
									site_ID: 2916284,
									global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
									status: 'private',
									other_URLs: {
										suggested_slug: 'chewbacca'
									},
									slug: 'jedi'
								}
							}
						} )
					},
					edits: {
						2916284: {
							841: {
								slug: ''
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( slug ).to.eql( '' );
		} );
	} );
} );
