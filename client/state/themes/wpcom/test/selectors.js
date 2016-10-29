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
	isSiteThemesLastPageForQuery
} from '../selectors';
import ThemeQueryManager from 'lib/query-manager/theme';

describe( 'selectors', () => {
	beforeEach( () => {
		getSiteThemes.memoizedSelector.cache.clear();
		getSiteTheme.memoizedSelector.cache.clear();
		getNormalizedTheme.memoizedSelector.cache.clear();
		getSiteThemesForQuery.memoizedSelector.cache.clear();
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
} );
