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

AFRAME.registerComponent('animate', {

	schema : {
		attribute : {
			type : 'string'
		},
		time : {
			type : 'int',
			default : 1000
		},
		easing : {
			type : 'string',
			default : 'Linear.None'
		}
	},

	init(){

		this.tween = null

		this.el.addEventListener('componentchanged', e => {
			if (!this.tween && e.detail.name === this.data.attribute){
				this.startAnimation(e.detail.oldData, e.detail.newData)
			}
		})
	},

	startAnimation(prevData, targetData){
		const attribute = this.data.attribute

		const el = this.el

		const easingProps = this.data.easing.split('.')
		const easing = TWEEN.Easing[easingProps[0]][easingProps[1]]

		this.tween = new TWEEN.Tween(prevData)
			.to(targetData, this.data.time)
			.onUpdate(function(){
				el.setAttribute(attribute, this)
			})
			.onComplete(() => {
				this.tween = null
			})
			.easing(easing)
			.start()

		this.el.setAttribute(attribute, prevData)
	}
})