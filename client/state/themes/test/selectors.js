/**
 * External dependencies
 */
import { expect } from 'chai';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getSiteThemes,
	getSiteTheme,
	getSiteThemesForQuery,
	isThemePublished,
	isRequestingSiteThemesForQuery,
	getSiteThemesFoundForQuery,
	getSiteThemesLastPageForQuery,
	isSiteThemesLastPageForQuery,
	getThemeDetailsUrl,
	getThemeSupportUrl,
	getThemeHelpUrl,
	getThemePurchaseUrl,
	getThemeCustomizeUrl,
	getThemeSignupUrl,
	getActiveTheme,
	isThemeActive,
	isThemePurchased
} from '../selectors';
import ThemeQueryManager from 'lib/query-manager/theme';

describe( 'themes selectors', () => {
	beforeEach( () => {
		getSiteThemes.memoizedSelector.cache.clear();
		getSiteTheme.memoizedSelector.cache.clear();
		getSiteThemesForQuery.memoizedSelector.cache.clear();
		isThemePublished.memoizedSelector.cache.clear();
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

	describe( '#getThemeDetailsUrl', () => {
		it( 'given a theme and no site ID, should return the details URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				}
			);
			expect( detailsUrl ).to.equal( '/theme/twentysixteen' );
		} );

		it( 'given a theme and wpcom site ID, should return the details URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				2916284
			);
			expect( detailsUrl ).to.equal( '/theme/twentysixteen/example.wordpress.com' );
		} );

		it( 'given a theme and Jetpack site ID, should return the details URL', () => {
			const detailsUrl = getThemeDetailsUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/'
								}
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				77203074
			);
			expect( detailsUrl ).to.equal( 'https://example.net/wp-admin/themes.php?theme=twentysixteen' );
		} );
	} );

	describe( '#getThemeSupportUrl', () => {
		context( 'for a premium theme', () => {
			it( 'given no site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						}
					},
					{
						id: 'mood',
						stylesheet: 'premium/mood'
					}
				);
				expect( supportUrl ).to.equal( '/theme/mood/setup' );
			} );

			it( 'given a wpcom site ID, should return the support URL', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						}
					},
					{
						id: 'mood',
						stylesheet: 'premium/mood'
					},
					2916284
				);
				expect( supportUrl ).to.equal( '/theme/mood/setup/example.wordpress.com' );
			} );
		} );

		context( 'for a free theme', () => {
			it( 'given no site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
					}
				);
				expect( supportUrl ).to.be.null;
			} );

			it( 'given a wpcom site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								2916284: {
									ID: 2916284,
									URL: 'https://example.wordpress.com'
								}
							}
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
					},
					2916284
				);
				expect( supportUrl ).to.be.null;
			} );

			it( 'given a Jetpack site ID, should return null', () => {
				const supportUrl = getThemeSupportUrl(
					{
						sites: {
							items: {
								77203074: {
									ID: 77203074,
									URL: 'https://example.net',
									jetpack: true,
									options: {
										admin_url: 'https://example.net/wp-admin/'
									}
								}
							}
						}
					},
					{
						id: 'twentysixteen',
						stylesheet: 'pub/twentysixteen'
					},
					77203074
				);
				expect( supportUrl ).to.be.null;
			} );
		} );
	} );

	describe( '#getThemeHelpUrl', () => {
		it( 'given a theme and no site ID, should return the help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
				}
			);
			expect( helpUrl ).to.equal( '/theme/mood/support' );
		} );

		it( 'given a theme and a wpcom site ID, should return the correct help URL', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
				},
				2916284
			);
			expect( helpUrl ).to.equal( '/theme/mood/support/example.wordpress.com' );
		} );

		it( 'given a theme and Jetpack site ID, should return null', () => {
			const helpUrl = getThemeHelpUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true,
								options: {
									admin_url: 'https://example.net/wp-admin/'
								}
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				77203074
			);
			expect( helpUrl ).to.be.null;
		} );
	} );

	describe( '#getThemePurchaseUrl', () => {
		it( 'given a free theme and a wpcom site ID, should return null', () => {
			const purchaseUrl = getThemePurchaseUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				2916284
			);
			expect( purchaseUrl ).to.be.null;
		} );

		it( 'given a premium theme and a wpcom site ID, should return the purchase URL', () => {
			const purchaseUrl = getThemePurchaseUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'mood',
					stylesheet: 'premium/mood'
				},
				2916284
			);
			expect( purchaseUrl ).to.equal( '/checkout/example.wordpress.com/theme:mood' );
		} );
	} );

	describe( '#getThemeCustomizeUrl', () => {
		it( 'given no theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl( {} );
			expect( customizeUrl ).to.equal( '/customize/' );
		} );

		it( 'given a theme and no site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				}
			);
			expect( customizeUrl ).to.equal( '/customize/' );
		} );

		it( 'given a theme and wpcom site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								URL: 'https://example.wordpress.com'
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				2916284
			);
			expect( customizeUrl ).to.equal( '/customize/example.wordpress.com?theme=pub/twentysixteen' );
		} );

		// FIXME: In implementation, get rid of `window` dependency.
		it.skip( 'given a theme and Jetpack site ID, should return the correct customize URL', () => {
			const customizeUrl = getThemeCustomizeUrl(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								URL: 'https://example.net',
								jetpack: true
							}
						}
					}
				},
				{
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				},
				77203074
			);
			expect( customizeUrl ).to.equal( '/customize/example.wordpress.com?theme=pub/twentysixteen' );
		} );
	} );

	describe( '#getThemeSignupUrl', () => {
		it( 'given a free theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl( {}, {
				id: 'twentysixteen',
				stylesheet: 'pub/twentysixteen'
			} );

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=twentysixteen' );
		} );

		it( 'given a premium theme, should return the correct signup URL', () => {
			const signupUrl = getThemeSignupUrl( {}, {
				id: 'mood',
				stylesheet: 'premium/mood'
			} );

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=mood&premium=true' );
		} );
	} );

	describe( '#getActiveTheme', () => {
		it( 'given no site, should return null', () => {
			const activeTheme = getActiveTheme( {} );

			expect( activeTheme ).to.be.null;
		} );

		it( 'given a wpcom site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 2916284
			);

			expect( activeTheme ).to.equal( 'mood' );
		} );

		it( 'given a Jetpack site, should return its currently active theme', () => {
			const activeTheme = getActiveTheme(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								jetpack: true,
								options: {
									theme_slug: 'twentysixteen'
								}
							}
						}
					}
				}, 77203074
			);

			expect( activeTheme ).to.equal( 'twentysixteen' );
		} );
	} );

	describe( '#isThemeActive', () => {
		it( 'given no theme and no site, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'mood'
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a site on which it isn\'t active, should return false', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'twentysixteen', 2916284
			);

			expect( isActive ).to.be.false;
		} );

		it( 'given a theme and a wpcom site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							2916284: {
								ID: 2916284,
								options: {
									theme_slug: 'premium/mood'
								}
							}
						}
					}
				}, 'mood', 2916284
			);

			expect( isActive ).to.be.true;
		} );

		it( 'given a theme and a Jetpack site on which it is active, should return true', () => {
			const isActive = isThemeActive(
				{
					sites: {
						items: {
							77203074: {
								ID: 77203074,
								jetpack: true,
								options: {
									theme_slug: 'twentysixteen'
								}
							}
						}
					}
				}, 'twentysixteen', 77203074
			);

			expect( isActive ).to.be.true;
		} );
	} );

	describe( '#isThemePurchased', () => {
		it( 'given no theme and no site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme but no site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'mood'
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme that has not been purchased on a given site, should return false', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'espresso', 2916284
			);

			expect( isPurchased ).to.be.false;
		} );

		it( 'given a theme that has been purchased on a given site, should return true', () => {
			const isPurchased = isThemePurchased(
				{
					purchases: {
						data: [
							{
								ID: 1234567,
								blog_id: 2916284,
								meta: 'mood',
								product_slug: 'premium_theme'
							}
						]
					}
				}, 'mood', 2916284
			);

			expect( isPurchased ).to.be.true;
		} );
	} );
} );
