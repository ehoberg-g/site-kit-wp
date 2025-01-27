/**
 * `modules/analytics-4` data store: properties tests.
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
import API from 'googlesitekit-api';
import {
	createTestRegistry,
	muteFetch,
	provideSiteInfo,
	unsubscribeFromAll,
	untilResolved,
} from '../../../../../tests/js/utils';
import {
	MODULES_ANALYTICS_4,
	PROPERTY_CREATE,
	WEBDATASTREAM_CREATE,
} from './constants';
import * as fixtures from './__fixtures__';

describe( 'modules/analytics-4 properties', () => {
	let registry;

	const createPropertyEndpoint = /^\/google-site-kit\/v1\/modules\/analytics-4\/data\/create-property/;
	const propertiesEndpoint = /^\/google-site-kit\/v1\/modules\/analytics-4\/data\/properties/;
	const propertyEndpoint = /^\/google-site-kit\/v1\/modules\/analytics-4\/data\/property/;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
		// Receive empty settings to prevent unexpected fetch by resolver.
		registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {} );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'actions', () => {
		describe( 'createProperty', () => {
			it( 'should create a property and add it to the store', async () => {
				const accountID = fixtures.createProperty.parent;

				fetchMock.post( createPropertyEndpoint, {
					body: fixtures.createProperty,
					status: 200,
				} );

				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.createProperty( accountID );
				expect( fetchMock ).toHaveFetched( createPropertyEndpoint, {
					body: { data: { accountID } },
				} );

				const properties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( accountID );
				expect( properties ).toMatchObject( [
					fixtures.createProperty,
				] );
			} );

			it( 'should dispatch an error if the request fails', async () => {
				const accountID = fixtures.createProperty.parent;
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetchMock.post( createPropertyEndpoint, {
					body: response,
					status: 500,
				} );

				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.createProperty( accountID );

				const error = registry
					.select( MODULES_ANALYTICS_4 )
					.getErrorForAction( 'createProperty', [ accountID ] );
				expect( error ).toMatchObject( response );

				// The response isn't important for the test here and we intentionally don't wait for it,
				// but the fixture is used to prevent an invariant error as the received properties
				// taken from `response.properties` are required to be an array.
				muteFetch( propertiesEndpoint, fixtures.properties );

				const properties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( accountID );
				// No properties should have been added yet, as the property creation failed.
				expect( properties ).toBeUndefined();
				expect( console ).toHaveErrored();
			} );
		} );

		describe( 'selectProperty', () => {
			it( 'should throw if property ID is invalid', () => {
				const callback = () =>
					registry
						.dispatch( MODULES_ANALYTICS_4 )
						.selectProperty( '' );
				expect( callback ).toThrow(
					'A valid propertyID selection is required.'
				);
			} );

			it( 'should set module settings correctly when PROPERTY_CREATE is passed', async () => {
				const settings = {
					propertyID: '12345',
					webDataStreamID: '1000',
					measurementID: 'abcd',
				};

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetSettings( settings );
				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.selectProperty( PROPERTY_CREATE );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getPropertyID()
				).toBe( PROPERTY_CREATE );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getWebDataStreamID()
				).toBe( WEBDATASTREAM_CREATE );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getMeasurementID()
				).toBe( '' );
			} );

			it( 'should set property ID only and reset datastream with measurement IDs when web data stream is not found', async () => {
				const propertyID = '09876';
				const settings = {
					propertyID: '12345',
					webDataStreamID: '1000',
					measurementID: 'abcd',
				};

				provideSiteInfo( registry, {
					referenceSiteURL: 'https://www.example.io',
				} );

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetSettings( settings );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreams( fixtures.webDataStreams, {
						propertyID,
					} );
				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.selectProperty( propertyID );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getPropertyID()
				).toBe( propertyID );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getWebDataStreamID()
				).toBe( WEBDATASTREAM_CREATE );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getMeasurementID()
				).toBe( '' );
			} );

			it( 'should set property, datastream, and measurement IDs when web data stream is found', async () => {
				const propertyID = '09876';
				const settings = {
					propertyID: '12345',
					webDataStreamID: '1000',
					measurementID: 'abcd',
				};

				provideSiteInfo( registry, {
					referenceSiteURL: 'https://www.example.org',
				} );

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetSettings( settings );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreams( fixtures.webDataStreams, {
						propertyID,
					} );
				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.selectProperty( propertyID );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getPropertyID()
				).toBe( propertyID );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getWebDataStreamID()
				).toBe( fixtures.webDataStreams[ 1 ]._id );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getMeasurementID()
				).toBe( fixtures.webDataStreams[ 1 ].measurementId ); // eslint-disable-line sitekit/acronym-case
			} );

			it( 'supports asynchronous webdatastream resolution', async () => {
				const propertyID = '09876';
				const settings = {
					propertyID: '12345',
					webDataStreamID: '1000',
					measurementID: 'abcd',
				};
				let resolveResponse;
				const responsePromise = new Promise( ( resolve ) => {
					resolveResponse = () => resolve( fixtures.webDataStreams );
				} );
				fetchMock.getOnce(
					/^\/google-site-kit\/v1\/modules\/analytics-4\/data\/webdatastreams/,
					responsePromise
				);

				provideSiteInfo( registry, {
					referenceSiteURL: 'https://www.example.org',
				} );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetSettings( settings );

				const promise = registry
					.dispatch( MODULES_ANALYTICS_4 )
					.selectProperty( propertyID );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getPropertyID()
				).toBe( propertyID );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getWebDataStreamID()
				).toBe( WEBDATASTREAM_CREATE );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getMeasurementID()
				).toBe( '' );

				resolveResponse();
				await promise;

				expect( fetchMock ).toHaveFetched(
					/^\/google-site-kit\/v1\/modules\/analytics-4\/data\/webdatastreams/
				);
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getPropertyID()
				).toBe( propertyID );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getWebDataStreamID()
				).toBe( fixtures.webDataStreams[ 1 ]._id );
				expect(
					registry.select( MODULES_ANALYTICS_4 ).getMeasurementID()
				).toBe( fixtures.webDataStreams[ 1 ].measurementId ); // eslint-disable-line sitekit/acronym-case
			} );
		} );

		describe( 'matchAccountProperty', () => {
			const accountID = '12345';
			const properties = [
				{ _id: '1001' },
				{ _id: '1002' },
				{ _id: '1003' },
			];

			beforeEach( () => {
				provideSiteInfo( registry );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperties( properties, { accountID } );
			} );

			it( 'should return NULL if no property matches the current site', async () => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreamsBatch(
						{
							1001: [],
							1002: [],
							1003: [],
						},
						{
							propertyIDs: properties.map( ( { _id } ) => _id ),
						}
					);

				const property = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchAccountProperty( accountID );
				expect( property ).toBeNull();
			} );

			it( 'should return a property object if a property matches the current site', async () => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreamsBatch(
						{
							1001: [
								{
									defaultUri: 'http://example.net',
								},
								{
									defaultUri: 'http://example.org',
								},
							],
							1002: [],
							1003: [
								{
									defaultUri: 'http://example.com',
								},
							],
						},
						{
							propertyIDs: properties.map( ( { _id } ) => _id ),
						}
					);

				const property = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchAccountProperty( accountID );
				expect( property ).toMatchObject( { _id: '1003' } );
			} );
		} );

		describe( 'matchAndSelectProperty', () => {
			const accountID = '123';
			const propertyID = '1001';
			const webDataStreamID = '2001';
			const measurementID = 'G-ABCD12345';

			beforeEach( () => {
				provideSiteInfo( registry );

				const properties = [
					{
						_id: propertyID,
					},
				];

				const webDataStreams = {
					[ propertyID ]: [
						{
							_id: webDataStreamID,
							measurementId: measurementID, // eslint-disable-line sitekit/acronym-case
							defaultUri: 'http://example.com',
						},
					],
				};

				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperties( properties, { accountID } );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreamsBatch( webDataStreams, {
						propertyIDs: Object.keys( webDataStreams ),
					} );
			} );

			it( 'should select the fallback property if the matching property is not found', async () => {
				provideSiteInfo( registry, {
					referenceSiteURL: 'http://example.net',
				} );

				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchAndSelectProperty( accountID, PROPERTY_CREATE );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getSettings()
				).toMatchObject( {
					propertyID: PROPERTY_CREATE,
					webDataStreamID: WEBDATASTREAM_CREATE,
					measurementID: '',
				} );
			} );

			it( 'should select the correct property ID if we can find a matching property', async () => {
				await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchAndSelectProperty( accountID );

				expect(
					registry.select( MODULES_ANALYTICS_4 ).getSettings()
				).toMatchObject( {
					propertyID,
					webDataStreamID,
					measurementID,
				} );
			} );
		} );

		describe( 'matchPropertyByURL', () => {
			const property = fixtures.properties[ 0 ];
			const propertyID = property._id;
			const propertyIDs = [ propertyID ];

			beforeEach( () => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperty( property, { propertyID } );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreamsBatch(
						fixtures.webDataStreamsBatch,
						{ propertyIDs }
					);
			} );

			it( 'should return a property object when a property is found', async () => {
				const url = 'https://www.example.org/';
				const matchedProperty = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchPropertyByURL( propertyIDs, url );
				expect( matchedProperty ).toEqual( property );
			} );

			it( 'should return NULL when a property is not found', async () => {
				const url = 'https://www.example.io/';
				const matchedProperty = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchPropertyByURL( propertyIDs, url );
				expect( matchedProperty ).toBeNull();
			} );
		} );

		describe( 'matchPropertyByMeasurementID', () => {
			const property = fixtures.properties[ 0 ];
			const propertyID = property._id;
			const propertyIDs = [ propertyID ];

			beforeEach( () => {
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperty( property, { propertyID } );
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetWebDataStreamsBatch(
						fixtures.webDataStreamsBatch,
						{ propertyIDs }
					);
			} );

			it( 'should return a property object when a property is found', async () => {
				const measurementID = '1A2BCD346E';
				const matchedProperty = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchPropertyByMeasurementID( propertyIDs, measurementID );
				expect( matchedProperty ).toEqual( property );
			} );

			it( 'should return NULL when a property is not found', async () => {
				const measurementID = '0000000000';
				const matchedProperty = await registry
					.dispatch( MODULES_ANALYTICS_4 )
					.matchPropertyByMeasurementID( propertyIDs, measurementID );
				expect( matchedProperty ).toBeNull();
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'getProperties', () => {
			it( 'should use a resolver to make a network request', async () => {
				fetchMock.get( propertiesEndpoint, {
					body: fixtures.properties,
					status: 200,
				} );

				const accountID = '12345';
				const initialProperties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( accountID );
				expect( initialProperties ).toBeUndefined();

				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperties( accountID );
				expect( fetchMock ).toHaveFetched( propertiesEndpoint, {
					query: { accountID },
				} );

				const properties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( accountID );
				expect( fetchMock ).toHaveFetchedTimes( 1 );
				expect( properties ).toEqual( fixtures.properties );
				expect( properties ).toHaveLength( fixtures.properties.length );
			} );

			it( 'should not make a network request if properties for this account are already present', async () => {
				const testAccountID = '12345';
				const accountID = testAccountID;

				// Load data into this store so there are matches for the data we're about to select,
				// even though the selector hasn't fulfilled yet.
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperties( fixtures.properties, { accountID } );

				const properties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( testAccountID );
				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperties( testAccountID );

				expect( fetchMock ).not.toHaveFetched( propertiesEndpoint );
				expect( properties ).toEqual( fixtures.properties );
				expect( properties ).toHaveLength( fixtures.properties.length );
			} );

			it( 'should dispatch an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetchMock.getOnce( propertiesEndpoint, {
					body: response,
					status: 500,
				} );

				const fakeAccountID = '777888999';
				registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( fakeAccountID );
				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperties( fakeAccountID );
				expect( fetchMock ).toHaveFetchedTimes( 1 );

				const properties = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( fakeAccountID );
				expect( properties ).toBeUndefined();
				expect( console ).toHaveErrored();
			} );
		} );

		describe( 'getProperty', () => {
			it( 'should use a resolver to make a network request', async () => {
				fetchMock.get( propertyEndpoint, {
					body: fixtures.properties[ 0 ],
					status: 200,
				} );

				const propertyID = '12345';
				const initialProperty = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				expect( initialProperty ).toBeUndefined();

				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperty( propertyID );
				expect( fetchMock ).toHaveFetched( propertyEndpoint, {
					query: { propertyID },
				} );

				const property = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				expect( property ).toEqual( fixtures.properties[ 0 ] );
				expect( fetchMock ).toHaveFetchedTimes( 1 );
			} );

			it( 'should not make a network request if the property is already present', async () => {
				const propertyID = '12345';
				registry
					.dispatch( MODULES_ANALYTICS_4 )
					.receiveGetProperty( fixtures.properties[ 0 ], {
						propertyID,
					} );

				const property = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperty( propertyID );

				expect( fetchMock ).not.toHaveFetched( propertyEndpoint );
				expect( property ).toEqual( fixtures.properties[ 0 ] );
			} );

			it( 'should not make a network request if the property is already received via getProperties selector', async () => {
				fetchMock.get( propertiesEndpoint, {
					body: fixtures.properties,
					status: 200,
				} );

				const accountID = '100';
				const propertyID = fixtures.properties[ 1 ]._id;

				registry
					.select( MODULES_ANALYTICS_4 )
					.getProperties( accountID );
				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperties( accountID );
				expect( fetchMock ).toHaveFetched( propertiesEndpoint );

				const property = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				expect( property ).toEqual( fixtures.properties[ 1 ] );
				expect( fetchMock ).not.toHaveFetched( propertyEndpoint );
				expect( fetchMock ).toHaveFetchedTimes( 1 );
			} );

			it( 'should dispatch an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};

				fetchMock.getOnce( propertyEndpoint, {
					body: response,
					status: 500,
				} );

				const propertyID = '777888999';
				registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				await untilResolved(
					registry,
					MODULES_ANALYTICS_4
				).getProperty( propertyID );
				expect( fetchMock ).toHaveFetchedTimes( 1 );

				const property = registry
					.select( MODULES_ANALYTICS_4 )
					.getProperty( propertyID );
				expect( property ).toBeUndefined();
				expect( console ).toHaveErrored();
			} );
		} );
	} );
} );
