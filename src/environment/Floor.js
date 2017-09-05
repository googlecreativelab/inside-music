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
import fragmentShader from '../shaders/floor.frag';
import { stringToHex } from 'utils/Helpers';


/**
 * shader-floor component
 * the floor of the scene that appears to reflect the activity of the orbs and rings
 */
AFRAME.registerComponent('shader-floor', {


	schema: {
		color: {
			default: '#333333',
			type: 'string'
		}
	},


    init(){
		const color = new THREE.Color(stringToHex(this.data.color));
        const mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(10, 10),
            new THREE.ShaderMaterial({
				fog: true,
                vertexShader,
                fragmentShader,
                uniforms: {
					u_startColor: {
						type: 'c',
						value: new THREE.Color(0xff0000)
					},
					u_endColor: {
						type: 'c',
						value: new THREE.Color(0x00ff00)
					},
					u_diffuseColor: {
						type: 'c',
						value: color
					},
                    u_num: {
                        type: 'f',
                        value: 0
                    },
					u_active: {
						type: 'iv',
						value: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
					},
                    u_time: {
                        type: 'f',
                        value: 1
                    },
                    u_amplitudes: {
                        type: 'fv',
                        value: [0, 0, 0, 0, 0, 0]
                    },
                    u_fade: {
                        type: 'f',
                        value: 0.4
                    },
                    u_normalMap: {
                        type: 't',
                        value: new THREE.TextureLoader().load('images/textures/saad/NormalMap_4.jpg')
					},
					u_specularMap: {
						type: 't',
						value: new THREE.TextureLoader().load('images/textures/floor-specular-1.jpg')
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
            })



        );

        mesh.rotateX(-Math.PI / 2);
        this.mesh = mesh;
        this.el.object3D.add(mesh);

        this.soundRings = [];


		this.onTrackComponentChanged = this.onTrackComponentChanged.bind(this);
    },

	update(){

		this.mesh.material.uniforms.u_diffuseColor.value.set(stringToHex(this.data.color));

	},


    onTrackComponentChanged(e){


		Array.from(document.querySelectorAll('a-entity[track-index]')).forEach((track, i)=>{
			if(i==0){
				this.mesh.material.uniforms.u_startColor.value = track.components['sound-rings'].startColor;
				this.mesh.material.uniforms.u_endColor.value = track.components['sound-rings'].endColor;
			}
			this.mesh.material.uniforms.u_active.value[i] = track.getAttribute('active') ? 1 : 0;
		});

    },

    tick(elapsed, delta){
        if(!this.soundRings.length){
            this.soundRings = Array.from(document.querySelectorAll('a-entity[sound-rings]'));
            this.mesh.material.uniforms.u_num.value = this.soundRings.length;

            Array.from(document.querySelectorAll('a-entity[track-index]')).forEach(track=>{
                track.addEventListener('componentchanged', this.onTrackComponentChanged);
            });
			return;
        }

        this.mesh.material.uniforms.u_amplitudes.value = this.soundRings.map(t=> Number(t.getAttribute('amplitude')));
        this.mesh.material.uniforms.u_time.value = elapsed / 1000;
    }


})


