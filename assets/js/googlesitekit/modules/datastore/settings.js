/**
 * `core/modules` data store settings
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
import invariant from 'invariant';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
const { createRegistrySelector, createRegistryControl } = Data;
import { CORE_MODULES } from './constants';

const SUBMIT_MODULE_CHANGES = 'SUBMIT_MODULE_CHANGES';

export const actions = {
	/**
	 * Submits all changes for a module.
	 *
	 * @since 1.20.0
	 *
	 * @param {string} slug Slug for module store.
	 * @return {Object} Module's submitChanges response object if it exists, otherwise object with `error` property if it doesn't.
	 */
	submitChanges( slug ) {
		invariant( slug, 'slug is required.' );

		return ( function* () {
			return yield {
				payload: { slug },
				type: SUBMIT_MODULE_CHANGES,
			};
		} )();
	},
};

export const controls = {
	[ SUBMIT_MODULE_CHANGES ]: createRegistryControl(
		( registry ) => ( { payload } ) => {
			const { slug } = payload;
			const storeName = registry
				.select( CORE_MODULES )
				.getModuleStoreName( slug );

			if ( ! storeName ) {
				return {
					error: `The module '${ slug }' does not have a store.`,
				};
			}

			const { submitChanges } = registry.dispatch( storeName );
			if ( ! submitChanges ) {
				return {
					error: `The module '${ slug }' does not have a submitChanges() action.`,
				};
			}

			return submitChanges( slug );
		}
	),
};

export const selectors = {
	/**
	 * Checks whether changes are currently being submitted for a module.
	 *
	 * @since 1.20.0
	 *
	 * @param {string} slug Slug for module store.
	 * @return {Object} Module's submitChanges response object if it exists, otherwise object with `error` property if it doesn't.
	 */
	isDoingSubmitChanges: createRegistrySelector(
		( select ) => ( state, slug ) => {
			invariant( slug, 'slug is required.' );
			const storeName = select( CORE_MODULES ).getModuleStoreName( slug );
			return !! select( storeName )?.isDoingSubmitChanges?.();
		}
	),

	/**
	 * Checks whether we can submit changes for a module.
	 *
	 * @since 1.20.0
	 *
	 * @param {string} slug Slug for module store.
	 * @return {boolean} Whether the module supports submitting changes.
	 */
	canSubmitChanges: createRegistrySelector( ( select ) => ( state, slug ) => {
		invariant( slug, 'slug is required.' );
		const storeName = select( CORE_MODULES ).getModuleStoreName( slug );
		return !! select( storeName )?.canSubmitChanges?.();
	} ),
};

export default {
	actions,
	controls,
	selectors,
};
