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
import './Cursor'
import './Retical'
import './ray-controls'
import 'aframe-auto-detect-controllers-component'

/**
 * ray-intersection-emitter component,
 * casts a ray based on what elements are provided as `front` and `back`
 * and emits events based on intersecting with elements
 *
 * @event `'intersection-start'`
 * @event `'intersection-end'`
 */
AFRAME.registerComponent('ray-intersection-emitter', {

	dependencies: ['raycaster'],

	schema : {
		front : {
			type : 'string'
		},
		back : {
			type : 'string'
		},
        updatePositions: {
			type: 'boolean',
			default: false
		},
		touch : {
			type : 'boolean',
			default : false
		}
	},

	init(){
        // bind All
        [
            'onClick',
            'onRaycasterIntersection',
            'onRaycasterIntersectionCleared',
            'onTouchEnd',
            'onTouchStart',
            'onTouchClick'
        ].forEach(fnStr=> this[fnStr] = this[fnStr].bind(this));

		this.el.setAttribute('cursor', 'fuse : false')
		this.el.setAttribute('raycaster', 'far: 5; objects: .selectable; interval: 60')

		this.el.addEventListener('raycaster-intersection', this.onRaycasterIntersection);
		this.el.addEventListener('raycaster-intersection-cleared', this.onRaycasterIntersectionCleared);
	},

	/**
	 * when an intersection has occurred
	 * @param {CustomEvent} event
	 */
	onRaycasterIntersection(event){
		//`back` is the resolved Group / Object3D specified as `data.back` attribute
		if (this.back){
			const intersected = this.el.components.raycaster.intersectedEls[0]
			document.querySelector(this.data.back).emit('intersection-start', intersected)
		}
	},

	/**
	 * when an intersection has cleared
	 * @param {CustomEvent} event
	 */
	onRaycasterIntersectionCleared(event){
		if (this.back){
			document.querySelector(this.data.back).emit('intersection-end')
		}
	},

	onClick(){
		const intersected = this.el.components.raycaster.intersectedEls[0]
		if (intersected){
			intersected.emit('click')
		}
	},

	onTouchEnd(){
		if (this.data.touch){
			this.el.setAttribute('raycaster', 'far', 0)
		}
	},

	onTouchClick(){
		if (this.data.touch){
			this.onClick()
		}
	},

	onTouchStart(){
		if (this.data.touch){
			this.el.setAttribute('raycaster', 'far', 5)
		}
	},

	update(){
		//get the front and back components
		if (this.data.front){
			this.frontEl = document.querySelector(this.data.front);
            this.front = this.frontEl.object3D;

			this.frontEl.addEventListener('touch-end', this.onTouchEnd);
			this.frontEl.addEventListener('touch-click', this.onTouchClick);
			this.frontEl.addEventListener('touch-start', this.onTouchStart);
		}

		if (this.data.back){
			this.back = document.querySelector(this.data.back).object3D

			document.querySelector(this.data.back).addEventListener('controller-click', this.onClick);
		}

		if (this.data.touch){
			this.el.setAttribute('raycaster', 'far', 0)
		}
	},

	tick(){
		// set the position of the back item
		if (this.data.updatePositions && this.back && this.front){
			const frontPosition = this.front.getWorldPosition()
			const backPosition = this.back.getWorldPosition()
			this.el.object3D.position.copy(frontPosition)
			this.el.object3D.lookAt(backPosition)
		}
	}

})
