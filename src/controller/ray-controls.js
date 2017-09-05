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

/**
 * ray-controls component
 * applies to a single 3 DOF or 6 DOF controller
 * it renders the cylinder protruding from the controller
 */
AFRAME.registerComponent('ray-controls', {

	schema : {
		hand: {
			type: 'string',
			default: 'right'
		},
		use : {
			type : 'boolean',
			default : false
		}
	},

	init(){

		const len = 1

		const frontEl = document.createElementWithAttributes('a-entity', {
			position: `0 0 -0.05`,
			'class': `tracked-ray-front-${this.data.hand}`
		})

		const cylinder = document.createElementWithAttributes('a-cylinder', {
			material : 'color: white; transparent: true; opacity: 0.2',
			radius : '0.001',
			scale : `1 ${len} 1`,
			position: `0 0 -${len/2}`,
			rotation : '-90 0 0',
		})

		this.frontEl = frontEl;

		this.el.appendChild(frontEl)
		frontEl.appendChild(cylinder)

		this.el.addEventListener('triggerdown', () => {
			this.el.emit('controller-click')
		})

		this.el.addEventListener('intersection-start', (e) => {
			cylinder.setAttribute('material', 'shader: flat; opacity: 0.8')
			const dist = e.detail.object3D.getWorldPosition().distanceTo(frontEl.object3D.getWorldPosition())
			// adjust the length of the cylinder to the distance between the elements
			cylinder.setAttribute('position', `0 0 -${dist/2}`)
			cylinder.setAttribute('scale', `1 ${dist} 1`)
		})

		this.el.addEventListener('intersection-end', () => {
			cylinder.setAttribute('material', 'opacity', 0.2)
			cylinder.setAttribute('position', `0 0 -${len/2}`)
			cylinder.setAttribute('scale', `1 ${len} 1`)
		})
	},

	update(){
	    this.frontEl.setAttribute('class', `tracked-ray-front-${this.data.hand}`);
		this.el.setAttribute('visible', this.data.use)
	}
})
