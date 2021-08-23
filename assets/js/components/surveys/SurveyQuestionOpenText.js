/**
 * SurveyQuestionOpenText component.
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
import { useState, useCallback } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SurveyHeader from './SurveyHeader';
import { TextField, Input, HelperText } from '../../material-components';
import Button from '../Button';
import VisuallyHidden from '../VisuallyHidden';

const MAXIMUM_CHARACTER_LIMIT = 100;

const SurveyQuestionOpenText = ( {
	question,
	answerQuestion,
	placeholder,
	subtitle,
	dismissSurvey,
	submitButtonText,
} ) => {
	const [ value, setValue ] = useState( '' );

	const handleSubmit = () => {
		answerQuestion( { answer: value } );
	};

	const onChange = useCallback(
		( event ) => {
			setValue( event.target.value.slice( 0, MAXIMUM_CHARACTER_LIMIT ) );
		},
		[ setValue ]
	);

	const instanceID = useInstanceId(
		SurveyQuestionOpenText,
		'SurveyQuestionOpenText'
	);

	return (
		<div className="googlesitekit-survey__open-text">
			<SurveyHeader title={ question } dismissSurvey={ dismissSurvey } />
			<div className="googlesitekit-survey__body">
				<VisuallyHidden>
					<label htmlFor={ instanceID }>{ placeholder }</label>
				</VisuallyHidden>
				<TextField
					name={ `survey-opentext-${ instanceID }` }
					helperText={
						subtitle ? (
							<HelperText>{ subtitle }</HelperText>
						) : undefined
					}
					onChange={ onChange }
					label={ placeholder }
					noLabel
				>
					<Input id={ instanceID } value={ value } />
				</TextField>
			</div>
			<div className="googlesitekit-survey__footer">
				<Button
					disabled={ value.length === 0 }
					onClick={ handleSubmit }
				>
					{ submitButtonText }
				</Button>
			</div>
		</div>
	);
};

SurveyQuestionOpenText.propTypes = {
	question: PropTypes.string.isRequired,
	subtitle: PropTypes.string.isRequired,
	placeholder: PropTypes.string.isRequired,
	answerQuestion: PropTypes.func.isRequired,
	dismissSurvey: PropTypes.func.isRequired,
	submitButtonText: PropTypes.string.isRequired,
};

export default SurveyQuestionOpenText;
