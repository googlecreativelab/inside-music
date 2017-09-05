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
import AudioBuffer from 'Tone/core/Buffer'
import tinycolor from 'tinycolor2'
import {Voice} from 'sound/Voice'
import {supported} from 'Config'
import Transport from 'Tone/core/Transport'
import '@ekolabs/aframe-spritesheet-component/dist/aframe-spritesheet-component'

AFRAME.registerComponent('loading', {

	schema : {
		loader : {
			default : false,
			type : 'boolean'
		},
		voiceOver : {
			default : false,
			type : 'boolean'
		}
	},

	init(){

		if (!supported){
			return
		}

		this.voice = new Voice()

		this.el.sceneEl.addEventListener('enter-360', () => {
			this.voice.intro()
		})

		this.el.sceneEl.addEventListener('enter-vr', () => {
			this.voice.intro(3)
		})

		this.first = false

		this.el.sceneEl.addEventListener('menu-selection', (e) => {
			this.voice.song(e.detail)
			//record as the first menu selection
			this.first = true
		})

		this.el.sceneEl.addEventListener('audio-loaded', () => {
			this.el.setAttribute('loading', 'loader', false)
		})

		this.el.sceneEl.addEventListener('buffering', () => {
			this.el.setAttribute('loading', 'loader', true)
		})

		this.el.sceneEl.addEventListener('buffering-end', () => {
			this.el.setAttribute('loading', 'loader', false)
		})

		this.voice.on('ended', () => {
			this.el.setAttribute('loading', 'voiceOver', false)
		})

		this.el.sceneEl.addEventListener('song-end', () => {
			const playButton = document.querySelector('#playButton')
			playButton.setAttribute('playbutton', 'playing:false; visible: false')
			//infoButton.setAttribute('infobutton', 'visible: false')
			this.voice.pickAnother()
		})

		this.el.sceneEl.addEventListener('end-vr', () => {
			this.voice.stop()
		})
	},

	update(){

		const loadingRing = document.querySelector('#loadingRing')
		const playButton = document.querySelector('#playButton')
		const menu = document.querySelector('#menu')
		//const infoButton = document.querySelector('#infoButton')

		//loading
		if (this.data.loader || this.data.voiceOver){
			loadingRing.setAttribute('visible', true)
			// loadingRing.setAttribute('scale', '0.5 0.5 0.5')
			// loadingRing.emit('appear')
			//set it to stop playing
			playButton.setAttribute('playbutton', 'playing:false; visible: false')
			//infoButton.setAttribute('infobutton', 'playing:false; visible: false')
		//done loading
		} else if (!this.data.loader && !this.data.voiceOver && this.first){
			loadingRing.setAttribute('visible', false)
			// loadingRing.setAttribute('scale', '0 0 0')
			// loadingRing.emit('disappear')
			// set it to start playing
			playButton.setAttribute('playbutton', 'playing:true; visible: true')
			this.el.sceneEl.emit('song-start')
			//infoButton.setAttribute('infobutton', 'visible: true')
		}
	},
})