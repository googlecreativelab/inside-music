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

import 'style/exit.scss'
import {GA} from 'utils/GA'
import {isMobile, is360} from 'utils/Helpers'

export class ExitButton {
	constructor(){
		const element = this.element = document.querySelector('#exitButton')

		element.addEventListener('click', () => {
			GA('ui', 'click', 'exit')
			window.location.reload()
		})

		const scene = document.querySelector('a-scene')
		scene.addEventListener('enter-360', () => this.show())
		scene.addEventListener('enter-vr', () => this.show())
		scene.addEventListener('exit-vr', () => this.hide())

	}
	show(){
		setTimeout(() => {
			if (!isMobile() || (isMobile() && is360())){
				this.element.classList.add('visible')
			}
		}, 10)
	}
	hide(){
		window.location.reload()
		this.element.classList.remove('visible')
	}
}