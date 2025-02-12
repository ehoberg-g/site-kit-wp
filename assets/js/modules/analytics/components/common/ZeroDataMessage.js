/**
 * Analytics ZeroDataMessage component.
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
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
const { useSelect } = Data;

export default function ZeroDataMessage( { skipPrefix } ) {
	const url = useSelect( ( select ) =>
		select( CORE_SITE ).getCurrentEntityURL()
	);

	const message = url
		? __( 'Your page hasn’t gotten any visitors yet', 'google-site-kit' )
		: __( 'Your site hasn’t gotten any visitors yet', 'google-site-kit' );

	if ( skipPrefix ) {
		return message;
	}

	return sprintf(
		/* translators: %s: message explaining why there is no data */
		__( 'No data to display: %s', 'google-site-kit' ),
		message
	);
}

ZeroDataMessage.propTypes = {
	skipPrefix: PropTypes.bool,
};
