/**
 * AdSense Settings form.
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
import { __, sprintf } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { MODULES_ADSENSE } from '../../datastore/constants';
import { parseAccountID } from '../../util/parsing';
import {
	ErrorNotices,
	UseSnippetSwitch,
	AutoAdExclusionSwitches,
} from '../common';
import ProgressBar from '../../../../components/ProgressBar';
import WebStoriesAdUnitSelect from '../common/WebStoriesAdUnitSelect';
import Link from '../../../../components/Link';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
const { useSelect } = Data;

export default function SettingsForm() {
	const webStoriesActive = useSelect( ( select ) =>
		select( CORE_SITE ).isWebStoriesActive()
	);
	const clientID = useSelect( ( select ) =>
		select( MODULES_ADSENSE ).getClientID()
	);
	const { existingTag, hasResolvedGetExistingTag } = useSelect(
		( select ) => ( {
			existingTag: select( MODULES_ADSENSE ).getExistingTag(),
			hasResolvedGetExistingTag: select(
				MODULES_ADSENSE
			).hasFinishedResolution( 'getExistingTag' ),
		} )
	);

	if ( ! hasResolvedGetExistingTag ) {
		return <ProgressBar />;
	}

	let checkedMessage, uncheckedMessage;
	if ( existingTag && existingTag === clientID ) {
		// Existing tag with permission.
		checkedMessage = __(
			'You’ve already got an AdSense code on your site for this account, we recommend you use Site Kit to place code to get the most out of AdSense.',
			'google-site-kit'
		);
		uncheckedMessage = checkedMessage;
	} else if ( existingTag ) {
		// Existing tag without permission.
		checkedMessage = sprintf(
			/* translators: %s: account ID */
			__(
				'Site Kit detected AdSense code for a different account %s on your site. For a better ads experience, you should remove AdSense code that’s not linked to this AdSense account.',
				'google-site-kit'
			),
			parseAccountID( existingTag )
		);
		uncheckedMessage = __(
			'Please note that AdSense will not show ads on your website unless you’ve already placed the code.',
			'google-site-kit'
		);
	} else {
		// No existing tag.
		uncheckedMessage = __(
			'Please note that AdSense will not show ads on your website unless you’ve already placed the code.',
			'google-site-kit'
		);
	}

	const supportURL =
		'https://support.google.com/adsense/answer/10175505#create-an-ad-unit-for-web-stories';

	return (
		<div className="googlesitekit-adsense-settings-fields">
			<ErrorNotices />

			<UseSnippetSwitch
				checkedMessage={ checkedMessage }
				uncheckedMessage={ uncheckedMessage }
			/>

			{ webStoriesActive && (
				<Fragment>
					<WebStoriesAdUnitSelect />
					<p>
						{ __(
							'This ad unit will be used for your Web Stories.',
							'google-site-kit'
						) }{ ' ' }
						<Link
							href={ supportURL }
							external
							inherit
							aria-label={ __(
								'Learn more about Ad Sense Web Stories.',
								'google-site-kit'
							) }
						>
							{ __( 'Learn more', 'google-site-kit' ) }
						</Link>
					</p>
				</Fragment>
			) }

			<AutoAdExclusionSwitches />
		</div>
	);
}
