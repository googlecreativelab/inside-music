/* global THREE */
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

import { lerp } from 'utils/Helpers';
import vertexShader from '../shaders/rings.vert';
import fragmentShader from '../shaders/rings.frag';


/**
 * RingPointMaterial
 * Links up the custom vertex and fragment shaders for a single circle of points
 * @extends THREE.RawShaderMaterial
 * @param {Object} [options]
 * @param {Number} [options.resolution=128]
 * @param {THREE.Color} [options.color=(1,1,1)]
 * @param {Number} [options.opacity=1.0]
 * @param {Number} [options.size=1.0]
 * @param {Number} [options.blending=THREE.NormalBlending]
 * @param {String} [options.shape='circle']
 * @param {Number} [options.radius=1.0]
 */
class RingPointMaterial extends THREE.RawShaderMaterial {

	constructor(options={}){

		options.resolution = options.resolution || 128;
		options.color = options.color || new THREE.Color(1,1,1);
		options.opacity = typeof options.opacity !== 'undefined' ? options.opacity : 1.0;
		options.size = options.size || 1.0;
		options.blending = options.blending || THREE.NormalBlending;
		options.shape = options.shape || 'circle';
		options.radius = options.radius || 1.0;

		const waveform = new Float32Array(options.resolution);
		for(let i=0; i<options.resolution; i++){
			waveform[i] = 0;
		}
		super({
			fog: true,
			blending: options.blending,
			defines: {
				'WAVEFORM_RESOLUTION': options.resolution
			},
			vertexShader,
			fragmentShader,
			// depthWrite: false,
			//depthTest: false,
			transparent: true, //options.opacity === 1 ? false : true,
			uniforms: {
				shape: {
					type: 't',
					value: new THREE.TextureLoader().load(`images/textures/${options.shape}.png`)
				},
				radius: {
					type: 'f',
					value: options.radius
				},
				size: {
					type: 'f',
					value: options.size
				},
				color: {
					type: 'c',
					value: options.color
				},
				opacity: {
					type: 'f',
					value: options.opacity
				},
				waveform: {
					type: 'fv1',
					value: waveform
				},
				amplitude: {
					type: 'f',
					value: 1.0
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
	}
};


/**
 * RingBufferGeometry
 * The geometry for a single circle of points
 * includes `reference` attribute for vertex shader to associate
 * an individual point to its waveform data.
 * @extends THREE.BufferGeometry
 * @param {Number} [resolution=128]
 */
class RingBufferGeometry extends THREE.BufferGeometry {
    constructor(resolution=128){
		super(new THREE.BufferGeometry());
		// console.log(`new geometry ${resolution}`)

        this.resolution = resolution;


		//position attribute, needs to be there,
		//but its calculated in the vertex shader
        const positions = new Float32Array(resolution * 3);

        // for(let i=0; i<resolution; i++){

        //     const angle = (i+1)/resolution * Math.PI * 2;
        //     const x = Math.cos(angle);
        //     const y = 0;
        //     const z = Math.sin(angle);


        //     positions[i * 3] = x;
        //     positions[i * 3 +1] = y;
        //     positions[i * 3 +2] = z;

        // }


        const posAttribute = new THREE.BufferAttribute(positions, 3);
        this.addAttribute('position', posAttribute);


		//index attribute, each point gets an index for reference on the waveform uniform
		const reference = new Float32Array(resolution);
		for(let i=0; i<resolution; i++){
			reference[i] = i/resolution;
		}

		const referenceAttribute = new THREE.BufferAttribute(reference, 1);
		this.addAttribute('reference', referenceAttribute);

		//since the positions are set in shader,
		//we need a custom boundingSphere to a void erroneous culling
		this.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 0.52);
    }

}


/**
 * geometryPool
 * re-use the same geometry for multiple objects with the same parameters
 * @type {{get, clear}}
 */
export const geometryPool = (function(){
	let pool = {};

    function get(resolution){
        //only make one geometry for any series of same parameters
        const key = `${resolution}`;
        pool[key] = pool[key] || [];
        while(pool[key].length < 2 ){
            pool[key].push(new RingBufferGeometry(1, resolution));
        }
        return pool[key][1];
    }

    function clear(){
        pool = {};
    }


    return { get, clear };

})();


/**
 * RingPoints
 * the `Object3D` for a single circle of particles
 * @extends THREE.Points
 * @see RingPointMaterial
 * @param {Object} [options] check `RingPointMaterial` for properties
 */
export class RingPoints extends THREE.Points {
	constructor(options={}){
		if(typeof options.useCache === 'undefined'){
			options.useCache = true;
		}

		if(typeof options.useCache !== 'undefined'){
			delete options.useCache;
		}

		const geom = new RingBufferGeometry(options.resolution);//geometryPool.get(options.resolution);

		super(
			geom,
			new RingPointMaterial(options)
		);

		this.renderOrder = 2;


		this.__goalProperties = {
			radius: this.material.uniforms.radius.value,
			opacity: this.material.uniforms.opacity.value
		};
	}

	transitionStep( t ){
	    for(let prop in this.__goalProperties){
	        const uni = this.material.uniforms[prop];
	        uni.value = lerp(0, this.__goalProperties[prop], t);
        }
	}

}
