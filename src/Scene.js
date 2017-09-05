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

import 'interface/Menu'
import 'interface/PlayButton'
import 'environment/Floor'
import 'environment/sound-rings'
import 'environment/atmosphere'
import 'song/Tracks'
import 'component/Animate'
import 'sound/Loading'
import Transport from 'Tone/core/Transport'
import {Controller} from 'controller/Controller'
import {getTrackData} from 'Config'


export class Scene {
	constructor(){

		const controller = this.controller = new Controller()

		const menuEl = document.querySelector('a-entity[menu]')
		const sceneEl = document.querySelector('a-scene')
		const tracksEl = document.querySelector('a-entity[tracks]')

        this.onEnter360 = this.onEnter360.bind(this);
        this.onEnterVR = this.onEnterVR.bind(this);

        sceneEl.addEventListener('enter-360', this.onEnter360);
        sceneEl.addEventListener('enter-vr', this.onEnterVR);

		menuEl.addEventListener('select', e => {

			console.log('starting', e.detail.artist)

			tracksEl.setAttribute('tracks', {
				artist : e.detail.artist
			})

			//update all of the waveforms
			document.querySelectorAll('a-entity[track]').forEach(t => t.setAttribute('waveform', e.detail.waveform))

			// set the sky also
			document.querySelector('a-sky').setAttribute('bg-color', e.detail.color)

			// set the scene to loading
			sceneEl.setAttribute('loading', 'loader', true)
			//start the voice over
			sceneEl.setAttribute('loading', 'voiceOver', true)

		})
	}

	onEnter360(){
		this.controller.start360()
	}

	onEnterVR(){
		this.controller.startVR()
	}
}

