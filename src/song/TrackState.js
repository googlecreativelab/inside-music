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
import 'song/Sphere'
import {trackRadius} from 'Config'

// register pointer events and active state and emit custom events from those
AFRAME.registerComponent('pointer-events', {
	schema : {
		type : 'boolean',
		default : false
	},
	init(){
		this.el.addEventListener('refresh', () => {
			this.el.setAttribute('pointer-events', false)
		})

		this.el.sceneEl.addEventListener('audio-loaded', () => {
			if (!this.el.getAttribute('disabled')){
				this.el.setAttribute('pointer-events', true)
			}
		})
	}
})

AFRAME.registerComponent('active', {
	schema : {
		type : 'boolean',
		default : false
	},
	init(){
		this.el.addEventListener('refresh', () => {
			this.el.setAttribute('active', false)
		})

		this.el.sceneEl.addEventListener('song-end', () => {
				this.el.setAttribute('active', false)
		})

		this.el.sceneEl.addEventListener('audio-loaded', () => {
			if (!this.el.getAttribute('disabled')){
				this.el.setAttribute('active', true)
			}
		})
	}
})

AFRAME.registerComponent('on-floor', {
	schema : {
		type : 'boolean',
		default : true
	},
	init(){

		this.el.sceneEl.addEventListener('audio-loaded', () => {
			if (!this.el.getAttribute('disabled')){
				this.el.setAttribute('on-floor', false)
			}
		})
		
		this.el.sceneEl.addEventListener('song-end', () => {
			this.el.setAttribute('on-floor', true)
		})

		this.el.sceneEl.addEventListener('menu-selection', () => {
			this.el.setAttribute('on-floor', true)
		})

		//set it initially
		this.el.setAttribute('position', 'y', 0.3)
	},
	update(){

		const trackIndex = this.el.getAttribute('track-index')
		const offset = Math.PI / 4
		const segmentAngle = (Math.PI * 2 - offset) / trackIndex.length
		const angle = segmentAngle * (trackIndex.index + 0.5) + offset/2
		const x = trackRadius * Math.sin(angle)
		const z = trackRadius * Math.cos(angle)

		const event = this.data ? 'floor-on' : 'floor-off'
		//fade in the text
		if (this.el.querySelector('a-text').emit){
			this.el.querySelector('a-text').emit(event)
		}
		const el = this.el
		const y = this.data ? 0.3 : 1.1
		if (this.tween){
			this.tween.stop()
		}
		this.tween = new TWEEN.Tween({y : this.el.object3D.position.y })
			.to({y}, 1800)
			.onUpdate(function(){
				el.setAttribute('position', `${x} ${this.y} ${z}`)
			})
			.easing(TWEEN.Easing.Quintic.Out)
			.delay(Math.random() * 200)
			.start()


		this.el.setAttribute('pointer-events', !this.data)
	}
})

AFRAME.registerComponent('disabled', {
	schema : {
		type : 'boolean',
		default : false
	},
	init(){
		this.el.addEventListener('refresh', () => {
			this.el.setAttribute('disabled', false)
		})

	},
	update(){
		if (this.data){
			this.el.setAttribute('on-floor', true)
			this.el.setAttribute('active', false)
			this.el.setAttribute('pointer-events', false)
		}
	}
})