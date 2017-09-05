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
import 'utils/Helpers'
import AudioBuffer from 'Tone/core/Buffer'
import 'aframe-look-at-component'
import { stringToHex } from 'utils/Helpers'
import Transport from 'Tone/core/Transport'

import vertexShader from '../shaders/basic.vert';
import fragmentShader from '../shaders/sphere.frag'


AFRAME.registerComponent('material-sphere', {

	schema: {
		opacity: {
			type: 'number',
			default: 1
		},
		tintColor: {
			type: 'string',
			default: '#ff0000'
		}
	},

	init(){
		const data = this.data;

		this.material = new THREE.ShaderMaterial({
			fog: true,
			vertexShader,
			fragmentShader,
			//transparent: true,
			uniforms: {
				enabled: {
					type: '1i',
					value: 0
				},
				opacity: {
					type: 'f',
					value: data.opacity
				},
				tintColor: {
					type: 'c',
					value: new THREE.Color(stringToHex(data.tintColor))
				},
				mixRate: {
					type: 'f',
					value: 0
				},
				fogNear: {
					type: 'f',
					value: 0
				},
				fogFar: {
					type: 'f',
					value: 0
				},
				fogColor: {
					type: 'c',
					value: new THREE.Color()
				}
			}
		});

		const mesh = this.el.getObject3D('mesh');
		if(mesh){
			mesh.renderOrder = 1;
			mesh.material = this.material;
		}
	},

	update(){
		const data = this.data;
		this.material.uniforms.opacity.value = data.opacity;
		this.material.uniforms.tintColor.value.setHex(stringToHex(data.tintColor));
	},


});

AFRAME.registerComponent('sphere', {

	schema : {
		name: {
			type : 'string'
		},
		tintColor: {
			type: 'string'
		}
	},

	init(){

		this._activeColor = 'white'
		this._inactiveColor = 'rgb(30, 30, 30)'

		const trackIndicator = document.createElementWithAttributes('a-entity', {
			scale : '0.15 0.15 0.15'
		})
		this.el.appendChild(trackIndicator)

		const sphereEl = this.sphereEl = document.createElement('a-sphere')
		sphereEl.setAttribute('material-sphere', 'opacity: 0.8; tintColor: #0000ff')//`transparent : true; color: ${this._inactiveColor}; opacity: 0.8; shader : flat`)
		sphereEl.setAttribute('position', '0 0.5 0')
		sphereEl.setAttribute('look-at', '[camera]')
		trackIndicator.appendChild(sphereEl)


		// the highlight ring
		const ring = document.createElement('a-ring')
		ring.setAttribute('color', 'white')
		ring.setAttribute('material', 'side: double; shader: flat;')
		ring.setAttribute('radius-inner', '1')
		ring.setAttribute('radius-outer', '1.1')
		ring.setAttribute('segments-theta', 64)
		ring.setAttribute('visible', false)
		ring.setAttribute('look-at', '[camera]')
		sphereEl.appendChild(ring)

		//make the ring appear on hover
		this.el.addEventListener('mouseenter', () => {
			if (this.el.getAttribute('pointer-events')){
				ring.setAttribute('visible', true)
			}
		})
		this.el.addEventListener('mouseleave', () => {
			if (this.el.getAttribute('pointer-events')){
				ring.setAttribute('visible', false)
			}
		})

		//add the sphere to the element
		sphereEl.classList.add('selectable')

		this._addText(trackIndicator)
		this._addEvents(sphereEl)

	},

	tick(){
		// get the player amplitude
		const amp = this.el.components.player.getAmplitude()
		// let height = amp*9 + 1
		// height = Math.log10(height)
		this.sphereEl.setAttribute('position', `0 ${amp-0.5} 0`)
		const smoothAmp = this.el.components['sound-rings'].amplitude;
		this.sphereEl.components['material-sphere'].material.uniforms.mixRate.value = smoothAmp * 2.5;
	},

	_addText(sphereEl){
		const textEntity = this.text = document.createElementWithAttributes('a-text', {
			value : '',
			position : '0 2 0',
			side : 'double',
			align : 'center',
			'wrap-count' : 12,
			width: 4,
			color : 'white',
			rotation : '0 180 0',
			opacity : 0,
			transparent : true,
			animate : 'attribute : opacity; time : 500;'
		})
		sphereEl.appendChild(textEntity)

		//fade in the text when it's off the floor
		/*this.el.addEventListener('floor-off', () => {
			textEntity.setAttribute('opacity', 1)
		})

		this.el.addEventListener('floor-on', () => {
			textEntity.setAttribute('opacity', 0)
		})*/

		const fadeInAnimation = document.createElementWithAttributes('a-animation', {
			'attribute': 'opacity',
			'begin': 'floor-on',
			'dur': '700',
			'to': 0
		})
		const fadeOutAnimation = document.createElementWithAttributes('a-animation', {
			'attribute': 'opacity',
			'begin': 'floor-off',
			'dur': '700',
			'to': 1
		})

		textEntity.appendChild(fadeInAnimation)
		textEntity.appendChild(fadeOutAnimation)
	},

	_addEvents(sphereEl){

		let lastClick = 0

		//active state
		sphereEl.addEventListener('click', () => {
			//toggle activation
			if (this.el.getAttribute('pointer-events')){
				//debounce
				if (Date.now() - lastClick > 500){
					lastClick = Date.now()
				} else {
					return
				}
				if (Transport.state !== 'started'){
					return
				}
				if (!this.el.getAttribute('active')){
					this.el.setAttribute('active', 'true')
				} else {
					this.el.setAttribute('active', 'false')
				}
				this.el.sceneEl.emit('sphere-click', {
					index : this.el.getAttribute('track-index').index,
					active : this.el.getAttribute('active')
				})
			}
		})

		//forward events to the sphere class
		this.el.addEventListener('componentchanged', e => {
			if (e.detail.name === 'active'){
				sphereEl.emit(e.detail.newData ? 'activate' : 'deactivate')
				sphereEl.components['material-sphere'].material.uniforms.enabled.value = e.detail.newData ? 1 : 0;
			}
		})

		//when it is active/inactive
		const activateAnim = document.createElementWithAttributes('a-animation', {
			'attribute': 'material.color',
			'begin': 'activate',
			'dur': '300',
			'to': this._activeColor,
		})
		sphereEl.appendChild(activateAnim)
		const deactivateAnim = document.createElementWithAttributes('a-animation', {
			'attribute': 'material.color',
			'begin': 'deactivate',
			'dur': '300',
			'to': this._inactiveColor,
		})
		sphereEl.appendChild(deactivateAnim)
	},

	update(){
		this.text.setAttribute('value', this.data.name.toUpperCase())
		this.sphereEl.setAttribute('material-sphere', `opacity: 0.8; tintColor: ${this.data.tintColor}`)

	}

})
