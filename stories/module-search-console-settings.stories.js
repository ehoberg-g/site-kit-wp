/**
 * Search Console Settings stories.
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
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import { MODULES_SEARCH_CONSOLE } from '../assets/js/modules/search-console/datastore/constants';
import createLegacySettingsWrapper from './utils/create-legacy-settings-wrapper';
import {
	createTestRegistry,
	provideUserAuthentication,
	provideModules,
	provideModuleRegistrations,
	freezeFetch,
} from '../tests/js/utils';

const Settings = createLegacySettingsWrapper( 'search-console' );

const defaultSettings = {
	propertyID: '',
};

const storyOptions = {
	decorators: [
		( Story ) => {
			const registry = createTestRegistry();

			registry.dispatch( MODULES_SEARCH_CONSOLE ).receiveGetSettings( {} );

			provideUserAuthentication( registry );
			provideModules( registry );
			provideModuleRegistrations( registry );

			return <Story registry={ registry } />;
		},
	],
};

storiesOf( 'Search Console Module/Settings', module )
	.add( 'View, closed', ( args, { registry } ) => {
		return <Settings isOpen={ false } registry={ registry } />;
	}, storyOptions )
	.add( 'View, open with all settings', ( args, { registry } ) => {
		registry.dispatch( MODULES_SEARCH_CONSOLE ).receiveGetSettings( {
			...defaultSettings,
			propertyID: 'http://example.com/',
		} );

		return <Settings isOpen registry={ registry } />;
	}, storyOptions )
	.add( 'Edit, Loading', ( args, { registry } ) => {
		registry.dispatch( MODULES_SEARCH_CONSOLE ).receiveGetSettings( defaultSettings );
		freezeFetch( /^\/google-site-kit\/v1\/modules\/search-console\/data\/matched-sites/ );

		return <Settings isOpen isEditing registry={ registry } />;
	}, storyOptions )
	.add( 'Edit, with all settings', ( args, { registry } ) => {
		registry.dispatch( MODULES_SEARCH_CONSOLE ).receiveGetSettings( {
			...defaultSettings,
			propertyID: 'http://example.com/',
		} );
		registry.dispatch( MODULES_SEARCH_CONSOLE ).receiveGetMatchedProperties( [
			{
				permissionLevel: 'siteFullUser',
				siteURL: 'https://www.example.io/',
			},
			{
				permissionLevel: 'siteFullUser',
				siteURL: 'http://example.com/',
			},
		] );

		return <Settings isOpen isEditing registry={ registry } />;
	}, storyOptions )
;
