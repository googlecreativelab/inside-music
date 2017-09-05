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

import { lerp, take, map, stringToHex, clamp, getHeadeset } from 'utils/Helpers';
import * as ring from './rings';
import animitter from 'animitter';
import easeIn from 'eases/expo-in';
import { isDaydream, isMobile } from 'utils/Helpers';


const setRings = (numRings, pointsPerRing, size, shape, sC, eC)=>{
	let radius = (i, len)=> map(i, 0, len-1, 0.18, 0.6666);
	size = size * (isMobile() ? 0.1 : (window.devicePixelRatio||1));
	size = isDaydream() ? 0.1 : size;

	// const headset = getHeadset();
    //
	// size = headset && headset.toLowerCase().indexOf('daydream') >= 0 ? size / 2 : size;

    const ringPoint = (i, len)=>
        new ring.RingPoints(
			{
                radius: radius(i,len),
				resolution: pointsPerRing,
                color: sC.clone().lerp(eC, i/len),
                opacity: Math.min(1, map(len-(i+1),len, 1, 4.0, 0.3)),
                size: lerp(size, size * 10, i/(len-1)),
                blending: THREE.AdditiveBlending,
				shape
            }
        );

    return take(numRings, ringPoint);
};


/**
 * sound-rings component
 * makes up all of the rings of particles around one orb
 */
window.AFRAME.registerComponent('sound-rings', {


    schema: {
		startColor: {
			default: '#ff0000',
			type: 'string'
		},
		endColor: {
			default: '#0000ff',
			type: 'string'
		},
		shape: {
			default: 'circle',
			type: 'string'
		},
		size: {
			default: 5.0,
			type: 'number'
		}
    },


    init(){
		ring.geometryPool.clear();
		const sHex = stringToHex(this.data.startColor);
		const eHex = stringToHex(this.data.endColor);

		this.startColor = new THREE.Color(sHex);
		this.endColor = new THREE.Color(eHex);

		this.numRings = isMobile() ? 25 : 40;
		this.pointsPerRing = isMobile() ? 64 : 128; //256;

        this.rings = setRings(
			this.numRings,
			this.pointsPerRing,
			4.5, //this.data.size,
			'circle', //this.data.shape,
			this.startColor,
			this.endColor);
		this.rings.forEach(r=> r.position.set(0, -0.25, 0));



		this.__cacheProperties();

		//this.rings.forEach(r=> r.material.uniforms.opacity.value = 0);

        this.rings.forEach(r=> this.el.object3D.add(r));
        this.waveformData = take(this.numRings, (i)=> new Float32Array(this.pointsPerRing));

		this.amplitude = 0;


		this.onTrackComponentChanged = this.onTrackComponentChanged.bind(this);
		this.el.addEventListener('componentchanged', this.onTrackComponentChanged);

		this.loop = animitter();
		this.__transition();
	},

	__cacheProperties(){
		//using this so we can fade them off and on based on active state of track
		this.__originalOpacities = this.rings.map(r=> r.material.uniforms.opacity.value);
		this.__originalRadii = this.rings.map(r=> r.material.uniforms.radius.value);
	},

	__transition(){
		const isActive = !!this.el.getAttribute('active');

		const ease = isActive ? easeIn : easeIn;

		this.loop
			.reset()
			.removeAllListeners()
			.on('update', (delta, elapsed)=>{

				this.rings.forEach((r,i, arr)=>{
					//const offset = isActive ? (arr.length - 1 - i) * 5 : i * 50;
					const offset = isActive ? i * 5 : i * 10;
					const duration = isActive ? 50 : 500;
					const t = clamp(ease(elapsed / (duration + offset)), 0, 1);
					const startOp = this.__originalOpacities[i];
					const startRad = this.__originalRadii[i];
					r.material.uniforms.radius.value = map(t, 0, 1, isActive ? 0 : startRad, isActive ? startRad : 0);
					r.material.uniforms.opacity.value = map(t, 0, 1, isActive ? 0 : startOp, isActive ? startOp : 0);
					const isLast = i === arr.length - 1; //(isActive && i === 0) || (!isActive && i == arr.length -1);
					if(isLast && t >= 1){
						this.loop.stop();
					}
				});

			})
			.start();
	},

	onTrackComponentChanged(e){
		if(e.detail.name !== 'active'){
			return;
		}
		this.__transition();
	},

	update(){

		this.startColor.setHex(stringToHex(this.data.startColor))
		this.endColor.setHex(stringToHex(this.data.endColor))

		const texture = new THREE.TextureLoader().load(`images/textures/${this.data.shape}.png`);

		this.rings.forEach((ring, i, arr)=>{
			ring.material.uniforms.size.value = this.data.size * (window.devicePixelRatio||1);
			ring.material.uniforms.color.value = this.startColor.clone().lerp(this.endColor, i/arr.length);
			ring.material.uniforms.shape.value = texture;
		});
	},

    tick(){

		let { player } = this.el.components;

		const nextAmp = player.getAmplitude();
		this.amplitude = Math.max(nextAmp, this.amplitude + ((nextAmp - this.amplitude) * 0.1));

		this.el.setAttribute('amplitude', this.amplitude);

		//pop out the last Float32Array and re-fill it with new data
        const wf = this.waveformData.pop();
        this.el.components.player.getWaveform(wf);
		//put it back in at the beginning
        this.waveformData.unshift(wf);

        this.rings.forEach((r, i)=>{
            r.material.uniforms.waveform.value = this.waveformData[i];
			r.material.uniforms.amplitude.value = this.amplitude;
        });

    }
});
