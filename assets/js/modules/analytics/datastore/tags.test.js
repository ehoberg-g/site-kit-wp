/**
 * modules/analytics data store: tags tests.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import API from 'googlesitekit-api';
import { STORE_NAME } from './index';
import {
	createTestRegistry,
	muteConsole,
	subscribeUntil,
	unsubscribeFromAll,
} from 'tests/js/utils';
import * as fixtures from './__fixtures__';

describe( 'modules/analytics tags', () => {
	let apiFetchSpy;
	let registry;
	let store;

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
		store = registry.stores[ STORE_NAME ].store;

		apiFetchSpy = jest.spyOn( { apiFetch }, 'apiFetch' );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
		apiFetchSpy.mockRestore();
	} );

	describe( 'actions', () => {

	} );

	describe( 'selectors', () => {
		describe( 'getTagPermission', () => {
			it( 'returns true if a user has access to this tag', async () => {
				fetch
					.doMockOnceIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/tag-permission/
					)
					.mockResponseOnce(
						JSON.stringify( fixtures.getTagPermissionsAccess ),
						{ status: 200 }
					);

				const propertyID = fixtures.getTagPermissionsAccess.propertyID;
				const accountID = fixtures.getTagPermissionsAccess.accountID;

				const initialSelect = registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );

				// Ensure the proper parameters were sent.
				expect( fetch.mock.calls[ 0 ][ 0 ] ).toMatchQueryParameters(
					{
						propertyID,
						accountID,
					}
				);

				// The connection info will be its initial value while the connection
				// info is fetched.
				expect( initialSelect ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getTagPermission( propertyID, accountID ) !== undefined
					),
				);

				const permissionForTag = registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );
				expect( fetch ).toHaveBeenCalledTimes( 1 );

				expect( permissionForTag ).toEqual( {
					accountID,
					permission: true,
				} );
			} );

			it( 'returns false if a user cannot access the requested tag', async () => {
				fetch
					.doMockOnceIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/tag-permission/
					)
					.mockResponseOnce(
						JSON.stringify( fixtures.getTagPermissionsNoAccess ),
						{ status: 403 }
					);

				const propertyID = fixtures.getTagPermissionsAccess.propertyID;
				const accountID = fixtures.getTagPermissionsAccess.accountID;

				// The API will return an error response here, so we mute the console.
				muteConsole( 'error' );
				const initialSelect = registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );
				// The connection info will be its initial value while the connection
				// info is fetched.
				expect( initialSelect ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getTagPermission( propertyID, accountID ) !== undefined
					),
				);

				const permissionForTag = registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );
				expect( fetch ).toHaveBeenCalledTimes( 1 );

				expect( permissionForTag ).toEqual( {
					accountID,
					permission: false,
				} );
			} );

			it( 'dispatches an error if the request fails', async () => {
				const response = {
					code: 'internal_server_error',
					message: 'Internal server error',
					data: { status: 500 },
				};
				fetch
					.doMockIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/tag-permission/
					)
					.mockResponse(
						JSON.stringify( response ),
						{ status: 500 }
					);

				const propertyID = fixtures.getTagPermissionsAccess.propertyID;
				const accountID = fixtures.getTagPermissionsAccess.accountID;

				muteConsole( 'error' );
				registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );
				await subscribeUntil( registry,
					// TODO: We may want a selector for this, but for now this is fine
					// because it's internal-only.
					() => store.getState().isFetchingTagPermission[ propertyID ] === false,
				);

				expect( fetch ).toHaveBeenCalledTimes( 1 );

				const permissionForTag = registry.select( STORE_NAME ).getTagPermission( propertyID, accountID );
				expect( permissionForTag ).toEqual( undefined );
			} );

			it( 'returns true if a user has access to this tag without passing account ID', async () => {
				fetch
					.doMockOnceIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/tag-permission/
					)
					.mockResponseOnce(
						JSON.stringify( fixtures.getTagPermissionsAccess ),
						{ status: 200 }
					);

				const propertyID = fixtures.getTagPermissionsAccess.propertyID;

				const initialSelect = registry.select( STORE_NAME ).getTagPermission( propertyID );

				// Ensure the proper parameters were sent.
				expect( fetch.mock.calls[ 0 ][ 0 ] ).toMatchQueryParameters(
					{
						propertyID,
						accountID: '',
					}
				);

				// The connection info will be its initial value while the connection
				// info is fetched.
				expect( initialSelect ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getTagPermission( propertyID ) !== undefined
					),
				);

				const permissionForTag = registry.select( STORE_NAME ).getTagPermission( propertyID );
				expect( fetch ).toHaveBeenCalledTimes( 1 );

				expect( permissionForTag ).toEqual( {
					accountID: fixtures.getTagPermissionsAccess.accountID,
					permission: true,
				} );
			} );

			it( 'returns false if a user cannot access the requested tag without passing account ID', async () => {
				fetch
					.doMockOnceIf(
						/^\/google-site-kit\/v1\/modules\/analytics\/data\/tag-permission/
					)
					.mockResponseOnce(
						JSON.stringify( fixtures.getTagPermissionsNoAccess ),
						{ status: 403 }
					);

				const propertyID = fixtures.getTagPermissionsAccess.propertyID;

				// The API will return an error response here, so we mute the console.
				muteConsole( 'error' );
				const initialSelect = registry.select( STORE_NAME ).getTagPermission( propertyID );
				// The connection info will be its initial value while the connection
				// info is fetched.
				expect( initialSelect ).toEqual( undefined );
				await subscribeUntil( registry,
					() => (
						registry.select( STORE_NAME ).getTagPermission( propertyID ) !== undefined
					),
				);

				const permissionForTag = registry.select( STORE_NAME ).getTagPermission( propertyID );
				expect( fetch ).toHaveBeenCalledTimes( 1 );

				expect( permissionForTag ).toEqual( {
					accountID: '',
					permission: false,
				} );
			} );
		} );
	} );
} );
