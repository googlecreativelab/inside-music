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

import BufferSource from 'Tone/source/BufferSource'
import Transport from 'Tone/core/Transport'
import Buffer from 'Tone/core/Buffer'
import Tone from 'Tone/core/Tone'
import Gain from 'Tone/core/Gain'
import events from 'events'

//each segment is 30 seconds
const SEG_TIME = 30

export class StreamingPlayer extends events.EventEmitter {
	constructor(folder, track, segments){

		super()

		this.segment = 0
		this.folder = folder
		this.track = track
		this.totalSegments = segments

		this.output = new Gain()

		this.playingSource = null

		this.id = Transport.scheduleRepeat((time) => {
			// remove the previous source
			this.playSegment(this.segment, time, 0)
			//load the next one
			this.segment++
			this.loadNext()
		}, 30, 0)

		this.started = false

		this._startMethod = (time, offset) => {
			//it was paused and restated
			if (this.started){
				// get the buffer segment
				const seg = Math.floor(offset / SEG_TIME)
				this.playSegment(seg, time, offset - seg * SEG_TIME)
			}
			this.started = true
		}

		this._pauseMethod = (time) => {
			if (this.playingSource){
				this.playingSource.stop(time, 0.1)
			}
		}

		this._stopMethod = (time) => {
			// clear all of the buffers
			this.buffers = []
		}

		Transport.on('start', this._startMethod)
		Transport.on('pause stop', this._pauseMethod)
		Transport.on('stop', this._stopMethod)

		this.buffers = []
		this.buffering = false
		this.loaded = false

		// load the first buffer and emit 'loaded event on first one'
		const firstBuffer = new Buffer(this.trackName(), () => {
			this.buffers[0] = firstBuffer
			this.loaded = true
			this.emit('loaded')
		})
	}

	loadNext(){
		if (!this.buffers[this.segment]){
			const seg = this.segment
			if (seg <= this.totalSegments){
				setTimeout(() => {
					const nextBuffer = new Buffer(this.trackName(), () => {
						if (this.buffering){
							this.buffering = false
							this.emit('bufferingEnd')
						}
						//remove the previous one
						if (this.buffers[seg-2]){
							this.buffers[seg-2] = null
						}
						this.buffers[seg] = nextBuffer
					})
				}, Math.random() * 5000 + 1000)
			}
		}
	}

	playSegment(seg, time, offset){
		if (this.buffers[seg]){
			//make the source 
			const source = new BufferSource(this.buffers[seg])
			source.connect(this.output)
			source.start(time, offset)
			this.playingSource = source

		} else {
			this.emit('buffering')
			this.buffering = true
		}
	}

	trackName(){
		return `./audio/${this.folder}/${this.track}-${this.segment}.[mp3|ogg]`
	}

	getWaveform(array){
		//the current segment
		if (Transport.seconds === 0){
			//everything is 0
			//typed-arrays dont have forEach in some old browsers (lookin at you ios9)
			for(let i=0; i<array.length; i++){
				array[i] = 0;
			}
		} else {
			const segNum = Math.floor(Transport.seconds / SEG_TIME)
			const offset = Transport.seconds - segNum * SEG_TIME
			const sample = Math.floor(offset * Transport.context.sampleRate)
			const buffer = this.buffers[segNum]
			if (buffer && sample < buffer.length){
				buffer.get().copyFromChannel(array, 0, sample)
			}
		}
	}

	dispose(){
		Transport.off('start', this._startMethod)
		Transport.off('pause stop', this._pauseMethod)
		Transport.off('stop', this._stopMethod)
		Transport.clear(this.id)
		this.removeAllListeners('buffering')
		this.removeAllListeners('bufferingEnd')
		this.removeAllListeners('loaded')
		setTimeout(() => {
			this.output.dispose()
		}, 500)
	}
}
