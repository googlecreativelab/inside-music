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

import 'aframe'
import Transport from 'Tone/core/Transport'
import {getTrackData} from 'Config'
import Master from 'Tone/core/Master'
import Visibility from 'visibilityjs'


AFRAME.registerSystem('player', {

	init(){
		this.players = []

		this.scheduleId = 0

		// set a timeout when the song ends
		this.sceneEl.addEventListener('menu-selection', e => {

			Transport.clear(this.scheduleId)

			const trackData = getTrackData(e.detail.artist)
			const duration = trackData.duration || 10
			this.scheduleId = Transport.schedule(() => {
				this.sceneEl.emit('song-end')
			}, duration)


		})

		//mute the master when the visibility is hidden
		Visibility.change((e, state) => {
			Master.mute = (state === 'hidden')
		})
	},

	loading(){
		let isLoaded = true
		this.players.forEach(p => isLoaded = p.isLoaded() && isLoaded)
		if (isLoaded){
			setTimeout(() => this.sceneEl.emit('audio-loaded'), 500)
		}
	},

	bufferingEnd(){
		let isBuffering = false
		this.players.forEach(p => isBuffering = p.isBuffering() || isBuffering)
		if (!isBuffering){
			this.sceneEl.emit('buffering-end')
		} 
	},

	buffering(){
		this.sceneEl.emit('buffering')
	},
})
