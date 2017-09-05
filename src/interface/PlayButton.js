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
import AudioBuffer from 'Tone/core/Buffer'
import Master from 'Tone/core/Master'
import {GA} from 'utils/GA'

AFRAME.registerComponent('playbutton', {

	schema : {
		playing : {
			default : false,
			type : 'boolean'
		}, 
		visible : {
			type : 'boolean',
			default : false
		}
	},

	init(){

		let lastClick = 0
		this.el.addEventListener('click', () => {
			//debounce
			if (Date.now() - lastClick > 500){
				lastClick = Date.now()
			} else {
				return
			}
			const playing = Transport.state === 'started'
			this.el.setAttribute('playbutton', 'playing', !playing)
			GA('playbutton', 'click', !playing ? 'play' : 'pause')
		})

		this.el.sceneEl.addEventListener('menu-selection', (e) => {
			Transport.stop()
		})


		/*this.el.sceneEl.addEventListener('end-vr', () => {
			
			Transport.stop()
		})*/
	},

	update(){

		if (this.timeout){
			clearTimeout(this.timeout)
		}

		if (this.data.playing){
			Transport.start('+0.25')
			this.el.querySelector('a-plane').setAttribute('src', '#pause_button')
			// this.el.querySelector('a-text').setAttribute('value', 'PAUSE')
		} else {
			Transport.pause()
			this.el.querySelector('a-plane').setAttribute('src', '#play_button')
			// this.el.querySelector('a-text').setAttribute('value', 'START')
		}

		if (this.data.visible){
			this.el.setAttribute('scale', '0.15 0.015 0.15')
		} else {
			this.el.setAttribute('scale', '0 0 0')
		}
	}
})