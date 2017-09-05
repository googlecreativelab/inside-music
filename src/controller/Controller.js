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
import './HandHeld'
import 'aframe-auto-detect-controllers-component'

AFRAME.registerComponent('controller', {

	dependencies: ['raycaster'],

	schema : {
		front : {
			type : 'string'
		},
		back : {
			type : 'string'
		},
		touch : {
			type : 'boolean',
			default : false
		}
	},

	init(){
		this.el.setAttribute('cursor', 'fuse : false')
		this.el.setAttribute('raycaster', 'far: 5; objects: .selectable; interval: 60')

		this.el.addEventListener('raycaster-intersection', event => {
			if (this.back){
				const intersected = this.el.components.raycaster.intersectedEls[0]
				document.querySelector(this.data.back).emit('intersection-start', intersected)
			}
		})

		this.el.addEventListener('raycaster-intersection-cleared', event => {
			if (this.back){
				document.querySelector(this.data.back).emit('intersection-end')
			}
		})

	},

	click(){
		const intersected = this.el.components.raycaster.intersectedEls[0]
		if (intersected){
			intersected.emit('click')
		}
	},

	update(){


		//get the front and back components
		if (this.data.front){
			this.front = document.querySelector(this.data.front).object3D

			document.querySelector(this.data.front).addEventListener('touch-end', () => {
				if (this.data.touch){
					this.el.setAttribute('raycaster', 'far', 0)
				}
			})

			document.querySelector(this.data.front).addEventListener('touch-click', () => {
				if (this.data.touch){
					this.click()
				}
			})

			document.querySelector(this.data.front).addEventListener('touch-start', () => {
				if (this.data.touch){
					this.el.setAttribute('raycaster', 'far', 5)
				}
			})
		}

		if (this.data.back){
			this.back = document.querySelector(this.data.back).object3D

			document.querySelector(this.data.back).addEventListener('controller-click', () => {
				this.click()
			})
		}

		if (this.data.touch){
			this.el.setAttribute('raycaster', 'far', 0)
		}
	},

	tick(){
		// set the position of the back item
		if (this.back && this.front){
			const frontPosition = this.front.getWorldPosition()
			const backPosition = this.back.getWorldPosition()
			this.el.object3D.position.copy(frontPosition)
			this.el.object3D.lookAt(backPosition)
		}
	}

})


export class Controller{
	constructor(){
		this.currentController = null
	}

	isMobile(){
		return document.querySelector('a-scene').isMobile
	}

	start360(){
		this.startCursor()
	}

	startVR(){
		if (this.isMobile()){
			// if it's mobile, add a retical,
			this.startRetical()
		} else {
			// otherwise add the vr controller
			this.startHandHeld()
		}
	}

	startHandHeld(){
		if (this.currentController !== 'handheld'){
			this.currentController = 'handheld'

			const rightHand = document.createElement('a-entity')
			document.querySelector('a-scene').appendChild(rightHand)
			rightHand.setAttribute('controller', 'front: #front-righthand; back: #righthand;')

			const leftHand = document.createElement('a-entity')
			document.querySelector('a-scene').appendChild(leftHand)
			leftHand.setAttribute('controller', 'front: #front-lefthand; back: #lefthand;')

			//mark the handheld controllers as in use
			document.querySelectorAll('[hand-held]').forEach(c => {
				c.setAttribute('hand-held', 'use', true)
			})

			this.logController()
		}
	}

	startCursor(){
		if (this.currentController !== 'cursor'){
			this.currentController = 'cursor'

			const mouseCursor = document.createElement('a-entity')
			mouseCursor.setAttribute('mouse-cursor', true)
			document.querySelector('a-scene').appendChild(mouseCursor)

			const entity = document.createElement('a-entity')
			document.querySelector('a-scene').appendChild(entity)
			entity.setAttribute('controller', `front: [mouse-cursor]; back: [camera]; touch:${this.isMobile()};`)

			this.logController()
		}
	}

	startRetical(){
		if (this.currentController !== 'retical'){
			this.currentController = 'retical'

			const retical = document.createElement('a-entity')
			retical.id = 'retical'
			retical.setAttribute('retical', true)

			document.querySelector('[camera]').appendChild(retical)

			const entity = document.createElement('a-entity')
			document.querySelector('a-scene').appendChild(entity)
			entity.setAttribute('controller', 'front: [retical]; back: [camera]; touch:false;')

			this.logController()
		}
	}

	logController(){
		console.log(`using ${this.currentController}`)
	}
}
