/**
 * `modules/analytics` data store: notification tests.
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
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	createTestRegistry,
	unsubscribeFromAll,
} from '../../../../../tests/js/utils';
import { enabledFeatures } from '../../../features';
import { MODULES_ANALYTICS } from './constants';

describe( 'modules/analytics notifications', () => {
	let registry;

	beforeEach( () => {
		registry = createTestRegistry();
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	describe( 'selectors', () => {
		describe( 'getSetupSuccessContent', () => {
			it( 'should return an object with the description and learnMore content when ga4setup flag is enabled', () => {
				enabledFeatures.add( 'ga4setup' );

				const setupSuccessContent = registry
					.select( MODULES_ANALYTICS )
					.getSetupSuccessContent();

				expect( setupSuccessContent ).toEqual( {
					description: __(
						'You’ll only see Universal Analytics data for now.',
						'google-site-kit'
					),
					learnMore: {
						label: 'Learn more',
						url:
							'https://sitekit.withgoogle.com/documentation/ga4-analytics-property/',
					},
				} );
			} );

			it( 'should return null if the ga4setup is not enabled', () => {
				const setupSuccessContent = registry
					.select( MODULES_ANALYTICS )
					.getSetupSuccessContent();

				expect( setupSuccessContent ).toBeNull();
			} );
		} );
	} );
} );
