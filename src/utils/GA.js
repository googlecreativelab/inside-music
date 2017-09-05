/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import domready from 'domready'
import {supported} from 'Config'

export function GA(category, action, label, value){
	if (window.googleAnalytics){
		if (typeof value !== 'undefined'){
			window.googleAnalytics('send', 'event', category, action, label, value)
		} else {
			window.googleAnalytics('send', 'event', category, action, label)
		}
	}
}


domready(() => {
	const scene = document.querySelector('a-scene')

	let currentArtist = null
	let songCounter = 0
	let songEndCounter = 0

	//listen for some events
	scene.addEventListener('menu-selection', e => {
		currentArtist = e.detail.artist.split(' ').join('-')
		songCounter++
		GA(currentArtist, 'select', `order-selected-${songCounter}`)
	})


	// song events
	scene.addEventListener('song-end', e => {
		songEndCounter++
		GA(currentArtist, 'end', `complete-plays-${songEndCounter}`)
	})
	
	scene.addEventListener('sphere-click', e => {
		GA(currentArtist, e.detail.active ? 'stem-on' : 'stem-off', `position-${e.detail.index}`)
	})
})
