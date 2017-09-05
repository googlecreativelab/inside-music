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

import {StreamingPlayer} from './StreamingPlayer'
import Meter from 'Tone/component/Meter'
import Gain from 'Tone/core/Gain'
import Analyser from 'Tone/component/Analyser'
import Panner3D from 'Tone/component/Panner3D'
import Transport from 'Tone/core/Transport'
import './Loading'
import './Listener'
import 'aframe'


AFRAME.registerComponent('player', {

	schema : {
		name : {
			type : 'string',
		},
		folder : {
			type : 'string'
		},
		segments : {
			type : 'int'
		}
	},

	init(){

		this.system.players.push(this)

		this._panner = new Panner3D({
			rolloffFactor : 1.25,
			/*panningModel : this.el.sceneEl.isMobile ? 'equalpower' : 'HRTF'*/
			panningModel : 'equalpower'
		}).toMaster()

		this._rms = 0

		this._amplitudeArray = new Float32Array(64)

		this._boost = new Gain().connect(this._panner)

		this._level = new Gain().connect(this._boost)

		this.el.addEventListener('componentchanged', e => {
			if (e.detail.name === 'active'){
				const vol = e.detail.newData ? 1 : 0
				this._level.gain.cancelScheduledValues()
				this._level.gain.rampTo(vol, 0.1, '+0.01')
			}
		})


		this.el.addEventListener('refresh', () => {
			this._level.gain.cancelScheduledValues()
			this._level.gain.value = 1
		})

		this.el.addEventListener('mouseenter', () => {
			// filter the player
			this._boost.gain.cancelScheduledValues()
			this._boost.gain.rampTo(1.5, 0.1, '+0.01')
		})

		this.el.addEventListener('mouseleave', () => {
			// filter the player
			this._boost.gain.cancelScheduledValues()
			this._boost.gain.rampTo(1, 0.4, '+0.01')
		})

		this.el.sceneEl.addEventListener('song-end', () => {
			this.el.setAttribute('player', 'name', '')
		})

		this.el.sceneEl.addEventListener('song-start', () => {
			this._level.gain.cancelScheduledValues()
			this._level.gain.value = 1
			console.log('starting', this._level.gain.value)
		})

	},

	update(){

		this.el.object3D.updateMatrixWorld()
		const matrixWorld = this.el.object3D.matrixWorld
		const position = new THREE.Vector3().setFromMatrixPosition(matrixWorld)

		this._panner.setPosition(position.x, position.y, position.z)

		if (this._player){
			this._player.dispose()
			this._player = null
		}

		//dispose the old player and load the new one
		if (this.data.name === 'null') {
			this.el.setAttribute('disabled', true)
		} else if (this.data.name !== ''){
			this.el.setAttribute('disabled', false)
			this._player = new StreamingPlayer(this.data.folder, this.data.name, this.data.segments)
			this._player.output.connect(this._level)

			this.el.classList.add('loading')

			this._player.on('loaded', () => this.system.loading())
			this._player.on('buffering', () => this.system.buffering())
			this._player.on('bufferingEnd', () => this.system.bufferingEnd())
		}
	},

	getWaveform(array){
		if (this._player){
			this._player.getWaveform(array)
		}
	},

	getAmplitude(){
		// average over the last 64 samples
		const len = 64
		if (this._player){
			const smoothing = 0.7
			if (this.el.getAttribute('active')){
				this.getWaveform(this._amplitudeArray)
				const samples = this._amplitudeArray
				let total = 0
                for(let i=0; i<samples.length; i++){
					total += samples[i] * samples[i];
				}
				total = Math.sqrt(total/len)
				if (total > 0.001){
					total += 0.4
				}
				const avg = smoothing * this._rms + (1 - smoothing) * total
				this._rms = Math.max(avg, this._rms * 0.98)
			} else {
				this._rms = 0.95 * this._rms
			}
			return this._rms
		} else {
			return 0
		}
	},

	isLoaded(){
		return this.el.getAttribute('disabled') || (this._player && this._player.loaded)
	},
	isBuffering(){
		return this._player && this._player.buffering
	}
})
