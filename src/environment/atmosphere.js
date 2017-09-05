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

import vertexShader from '../shaders/basic.vert';
import fragmentShader from '../shaders/atmosphere.frag';


class AtmosphereMaterial extends THREE.ShaderMaterial {


	constructor(){

		super({
			fog: true,
			vertexShader,
			fragmentShader,
			uniforms: {
				u_time: {
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
			},
			transparent: true
		});

		this.side = THREE.BackSide;

	}



}



AFRAME.registerComponent('atmosphere', {


	init(){

		this.mesh = new THREE.Mesh(
			new THREE.SphereGeometry(1, 36, 36),
			new AtmosphereMaterial()
		);


		this.el.object3D.add(this.mesh);
	},


	tick(elapsed){
		this.mesh.material.uniforms.u_time.value = elapsed / 1000;
	}

});
