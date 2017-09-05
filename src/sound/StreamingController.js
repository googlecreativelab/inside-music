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

import Transport from 'Tone/core/Transport'
import {StreamingPlayer} from './StreamingPlayer'
import events from 'events'

export class StreamingController extends events.EventEmitter {
	constructor(folder, tracks, length){

		super()

		this.tracks = []
		tracks.forEach(t => {
			const track = new StreamingPlayer(folder, t, length)
			this.tracks.push(track)
			track.on('buffering', () => {
				if (Transport.state === 'started'){
					Transport.pause()
					this.emit('buffering')
				}
			})
			track.on('bufferingEnd', () => {
				// when they are all buffered, restart it
				if (!this.buffering){
					Transport.start()
					this.emit('bufferingEnd')
				}
			})
			track.on('loaded', () => {
				if (this.loaded){
					this.emit('loaded')
				}
			})
		})
	}
	get(num){
		return this.tracks[num].output
	}
	dispose(){
		Transport.stop()
		Transport.off('start stop pause')
		this.tracks.forEach(track => track.dispose())
	}
	start(){
		Transport.start()
	}
	pause(){
		Transport.pause()
	}
	get buffering(){
		let buffering = false
		this.tracks.forEach(t => buffering = buffering || t.buffering)
		return buffering
	}
	get loaded(){
		let loaded = true
		this.tracks.forEach(t => loaded = loaded && t.loaded)
		return loaded
	}
	forEach(cb){
		this.tracks.forEach(cb)
	}
}