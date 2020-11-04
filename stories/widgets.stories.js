/**
 * Widget Stories.
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
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import Widget from '../assets/js/googlesitekit/widgets/components/Widget';

function BoxesWidgets( { children } ) {
	return (
		<div className="mdc-layout-grid googlesitekit-widget-area googlesitekit-widget-area--boxes">
			<div className="googlesitekit-widget-area-widgets">
				<div className="mdc-layout-grid__inner">
					{ children }
				</div>
			</div>
		</div>
	);
}

function CompositeWidgets( { children } ) {
	return (
		<div className="mdc-layout-grid googlesitekit-widget-area googlesitekit-widget-area--composite">
			<div className="googlesitekit-widget-area-widgets">
				<div className="mdc-layout-grid__inner">
					<div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
						<div className="mdc-layout-grid">
							<div className="mdc-layout-grid__inner">
								{ children }
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function QuarterWidgetInGrid( props ) {
	return (
		<div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-3-desktop mdc-layout-grid__cell--span-4-tablet">
			<Widget { ...props } />
		</div>
	);
}

storiesOf( 'Global/Widgets', module )
	.add( 'Widgets in boxes layout', () => (
		<BoxesWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</BoxesWidgets>
	) )
	.add( 'Widgets in composite layout', () => (
		<CompositeWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</CompositeWidgets>
	) )
	.add( 'Widgets without padding in boxes layout', () => (
		<BoxesWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
					noPadding
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</BoxesWidgets>
	) )
	.add( 'Widgets without padding in composite layout', () => (
		<CompositeWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
					noPadding
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</CompositeWidgets>
	) )
	.add( 'Widgets with header and footer in boxes layout', () => (
		<BoxesWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
					header={ () => <div>Widget header</div> }
					footer={ () => <div>Widget footer</div> }
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</BoxesWidgets>
	) )
	.add( 'Widgets with header and footer in composite layout', () => (
		<CompositeWidgets>
			{ [ 1, 2, 3, 4 ].map( ( count ) => (
				<QuarterWidgetInGrid
					key={ `widget${ count }` }
					slug={ `widget${ count }` }
					header={ () => <div>Widget header</div> }
					footer={ () => <div>Widget footer</div> }
				>
					{ count === 4 && <div>Widget with more body content.</div> }
					{ count !== 4 && <div>Widget body content.</div> }
				</QuarterWidgetInGrid>
			) ) }
		</CompositeWidgets>
	) );
