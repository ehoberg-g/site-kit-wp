/**
 * `core/widgets` data store: widget tests.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import {
	createTestRegistry,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import { CORE_WIDGETS } from './constants';
import SiteKitLogo from '../../../../svg/logo-sitekit.svg';

describe( 'core/widgets Widget areas', () => {
	let registry;
	let store;

	beforeEach( () => {
		registry = createTestRegistry();
		store = registry.stores[ CORE_WIDGETS ].store;
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'actions', () => {
		describe( 'assignWidgetArea', () => {
			it( 'should implicitly create a context when assigning a widget area, if one does not exist', () => {
				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'header', 'testarea' );

				const { contextAssignments } = store.getState();

				expect( contextAssignments.testarea ).toEqual( [ 'header' ] );
			} );

			it( 'should re-use a context if one is already created', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'header', 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'footer', 'testarea' );

				const { contextAssignments } = store.getState();

				expect( contextAssignments.testarea ).toEqual( [
					'header',
					'footer',
				] );
			} );

			it( 'should assign a registered widget area to a context', () => {
				// Register the widget area.
				const slug = 'header';
				const settings = {
					priority: 10,
					title: 'Your Site',
					subtitle: 'Learn about your site!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slug, settings );

				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slug, 'testarea' );

				// Get all assigned widget areas for the testarea context.
				const testareaAreas = registry
					.select( CORE_WIDGETS )
					.getWidgetAreas( 'testarea' );

				expect( testareaAreas ).toHaveLength( 1 );
				expect(
					testareaAreas.some( ( area ) => area.slug === slug )
				).toEqual( true );
			} );
		} );

		describe( 'registerWidgetArea', () => {
			it( 'should register a widget area', () => {
				const slug = 'header';
				const settings = {
					priority: 10,
					title: 'Your Site',
					subtitle: 'Learn about your site!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slug, settings );
				const state = store.getState();

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( slug )
				).toEqual( true );
				// There is no selector for unassigned widget areas, so we inspect the store directly for
				// this test.
				expect( state.areas ).toMatchObject( {
					[ slug ]: { ...settings, slug },
				} );
			} );

			it( 'requires a slug', () => {
				expect( () => {
					registry
						.dispatch( CORE_WIDGETS )
						.registerWidgetArea( null, {} );
				} ).toThrow( 'slug is required.' );
			} );

			it( 'requires settings', () => {
				// (It will throw for the first missing param, because the settings argument is
				// always defined .)
				expect( () => {
					registry
						.dispatch( CORE_WIDGETS )
						.registerWidgetArea( 'my-cool-slug' );
				} ).toThrow( 'settings.title is required.' );
			} );

			it( 'requires a title in settings', () => {
				expect( () => {
					registry
						.dispatch( CORE_WIDGETS )
						.registerWidgetArea( 'header', {} );
				} ).toThrow( 'settings.title is required.' );

				expect( () => {
					registry
						.dispatch( CORE_WIDGETS )
						.registerWidgetArea( 'header', {
							title: 'Analytics Header',
							subtitle: 'Analytics tell you about visitors',
						} );
				} ).not.toThrow();

				expect( () => {
					registry
						.dispatch( CORE_WIDGETS )
						.registerWidgetArea( 'header', {
							title: 'Analytics Header',
							subtitle: 'Analytics tell you about visitors',
							style: 'composite',
						} );
				} ).not.toThrow();

				expect( console ).toHaveWarned();
			} );

			it( 'should register multiple widget areas', () => {
				const slugOne = 'dashboard-header';
				const settingsOne = {
					priority: 10,
					title: 'Header',
					subtitle: 'Cool stuff only!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				const slugTwo = 'dashboard-footer';
				const settingsTwo = {
					priority: 12,
					title: 'Footer',
					subtitle: 'Less important stuff.',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugOne, settingsOne );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugTwo, settingsTwo );
				const state = store.getState();

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( slugOne )
				).toEqual( true );
				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( slugTwo )
				).toEqual( true );
				// There is no selector for unassigned widget areas, so we inspect the store directly for
				// this test.
				expect( state.areas ).toMatchObject( {
					[ slugOne ]: { ...settingsOne, slug: slugOne },
					[ slugTwo ]: { ...settingsTwo, slug: slugTwo },
				} );
			} );

			it( 'should use priority: 10 as a default', () => {
				const slug = 'pageviews';
				const settings = {
					title: 'Page Views',
					subtitle: 'See all your views!',
					Icon: SiteKitLogo,
					style: 'boxes', // 'composite'
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slug, settings );
				const state = store.getState();

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( slug )
				).toEqual( true );
				// There is no selector for unassigned widget areas, so we inspect the store directly for
				// this test.
				expect( state.areas ).toMatchObject( {
					[ slug ]: { ...settings, priority: 10, slug },
				} );
			} );

			it( 'should not overwrite an existing widget area', () => {
				const slug = 'pageviews';
				const settings = {
					priority: 10,
					title: 'Page Views',
					subtitle: 'See all your views!',
					Icon: SiteKitLogo,
					style: 'boxes', // 'composite'
				};
				// We don't want other widget areas to be able to overwrite existing areas.
				const differentSettings = {
					priority: 10,
					title: 'Mega Page Views',
					subtitle: 'Subscribe for more features!',
					Icon: SiteKitLogo,
					style: 'composite',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slug, settings );

				// Expect console warning about duplicate slug.
				const consoleWarnSpy = jest.spyOn( global.console, 'warn' );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slug, differentSettings );
				expect( consoleWarnSpy ).toHaveBeenCalledWith(
					`Could not register widget area with slug "${ slug }". Widget area "${ slug }" is already registered.`
				);
				consoleWarnSpy.mockClear();

				const state = store.getState();

				// Ensure the original settings are registered.
				expect( state.areas ).toMatchObject( {
					[ slug ]: { ...settings, slug },
				} );
				expect( state.areas ).not.toMatchObject( {
					[ slug ]: { ...differentSettings, slug },
				} );
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getWidgetAreas', () => {
			it( 'requires a contextSlug', () => {
				expect( () => {
					registry.select( CORE_WIDGETS ).getWidgetAreas();
				} ).toThrow( 'contextSlug is required.' );
			} );

			it( 'returns all registered widget areas', () => {
				// Register the widget area.
				const slugOne = 'header';
				const slugTwo = 'subheader';
				const settings = {
					priority: 10,
					title: 'Your Site',
					subtitle: 'Learn about your site!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugOne, settings );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugTwo, settings );

				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugOne, 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugTwo, 'testarea' );

				// Get all assigned widget areas for the testarea context.
				const testareaAreas = registry
					.select( CORE_WIDGETS )
					.getWidgetAreas( 'testarea' );

				expect( testareaAreas ).toMatchObject( [
					{ ...settings, slug: slugOne },
					{ ...settings, slug: slugTwo },
				] );
			} );

			it( 'does not return unregistered widget areas', () => {
				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'area-one', 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'area-two', 'testarea' );

				// Get all assigned widget areas for the testarea context.
				const testareaAreas = registry
					.select( CORE_WIDGETS )
					.getWidgetAreas( 'testarea' );

				expect( testareaAreas ).toHaveLength( 0 );
			} );

			it( 'returns widget areas that were registered after they were assigned', () => {
				const slugOne = 'header';
				const slugTwo = 'subheader';

				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugOne, 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugTwo, 'testarea' );

				// Register the widget areas.
				const settings = {
					priority: 10,
					title: 'Your Site',
					subtitle: 'Learn about your site!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugOne, settings );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugTwo, settings );

				// Get all assigned widget areas for the testarea context.
				const testareaAreas = registry
					.select( CORE_WIDGETS )
					.getWidgetAreas( 'testarea' );

				expect( testareaAreas ).toMatchObject( [
					{ ...settings, slug: slugOne },
					{ ...settings, slug: slugTwo },
				] );
			} );

			it( 'returns the widget areas sorted by priority', () => {
				// Register the widget area.
				const slugLowest = 'header';
				const slugMedium = 'header2';
				const slugMediumTwo = 'header3';
				const slugHighest = 'header4';
				const settings = {
					title: 'Your title',
					subtitle: 'Okay!',
					Icon: SiteKitLogo,
					style: 'boxes',
				};
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugLowest, {
						...settings,
						priority: 5,
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugMedium, {
						...settings,
						priority: 10,
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugMediumTwo, {
						...settings,
						priority: 10,
					} );
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( slugHighest, {
						...settings,
						priority: 15,
					} );

				// Assign this widget area to the testarea context.
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugLowest, 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugMedium, 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugMediumTwo, 'testarea' );
				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( slugHighest, 'testarea' );

				// Get all assigned widget areas for the testarea context.
				const testareaAreas = registry
					.select( CORE_WIDGETS )
					.getWidgetAreas( 'testarea' );

				// The lowest priority appears first.
				expect( testareaAreas[ 0 ] ).toMatchObject( {
					...settings,
					slug: slugLowest,
				} );
				// Widgets assigned with the same priority should be last-in, last-out.
				expect( testareaAreas[ 1 ] ).toMatchObject( {
					...settings,
					slug: slugMedium,
				} );
				expect( testareaAreas[ 2 ] ).toMatchObject( {
					...settings,
					slug: slugMediumTwo,
				} );
				expect( testareaAreas[ 3 ] ).toMatchObject( {
					...settings,
					slug: slugHighest,
				} );
			} );
		} );

		describe( 'getWidgetArea', () => {
			it( 'returns an area if the widget area is registered', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'TestArea', {
						title: 'Test Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'composite',
					} );

				expect(
					registry.select( CORE_WIDGETS ).getWidgetArea( 'TestArea' )
				).toEqual( {
					Icon: undefined,
					priority: 10,
					title: 'Test Header',
					subtitle: 'Cool stuff for yoursite.com',
					style: 'composite',
					slug: 'TestArea',
				} );
			} );

			it( 'returns null if the widget area is not registered', () => {
				expect(
					registry
						.select( CORE_WIDGETS )
						.getWidgetArea( 'NotRealArea' )
				).toEqual( null );
			} );
		} );

		describe( 'isWidgetAreaRegistered', () => {
			it( 'returns true if the widget area is registered', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'TestArea', {
						title: 'Test Header',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'composite',
					} );

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( 'TestArea' )
				).toEqual( true );
			} );

			it( 'returns false if the widget area is not registered', () => {
				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetAreaRegistered( 'NotRealArea' )
				).toEqual( false );
			} );
		} );
	} );
} );
