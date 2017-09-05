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
 * retical component
 * visually renders the retical circle,
 * this component should be applied to the camera so that it stays in the same position always
 */
AFRAME.registerComponent('retical', {

	init(){
		// add a retical
		this.el.setAttribute('geometry', 'primitive:ring; radius-inner: 1; radius-outer: 1.5')
		this.el.setAttribute('material', 'color: white; transparent: true; opacity: 0.6; shader: flat')
		this.el.setAttribute('scale', '0.02 0.02 0.02')
		this.el.setAttribute('position', '0 0 -0.9')
	},
})
