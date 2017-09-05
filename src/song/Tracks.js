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
import 'song/Sphere'
import 'song/TrackState'
import 'sound/Player'
import 'sound/PlayerSystem'
import {trackRadius, trackConfig, getTrackData} from 'Config'


/**
 * tracks component
 * a single component that creates all of the individual players and visuals
 */
AFRAME.registerComponent('tracks', {

	schema : {
		artist : {
			type : 'string'
		}
	},

	init(){
		this.el.id = 'tracks'

		// make all of the tracks initially
		const maxTracks = trackConfig.reduce((max, track)=> Math.max(max, track.names.length), 0);

		this.tracks = []

		for (let i = 0; i < maxTracks; i++){
			const track = document.createElement('a-entity');
			this.tracks.push(track);
			track.setAttribute('sphere', 'tintColor:#000000');
			track.setAttribute('track-state', '');
			track.setAttribute('pointer-events', false);
			track.setAttribute('active', 'false');
			track.setAttribute('player', '');
			track.setAttribute('track-index', `index : ${i}; length: ${maxTracks}`);
			track.setAttribute('on-floor', true);
			track.setAttribute('sound-rings', '');
			this.el.appendChild(track);
		}

		//clear the artist when the song ends
		this.el.sceneEl.addEventListener('song-end', () =>
			this.el.setAttribute('tracks', 'artist', '')
		)
	},

	update(){

		// set them all to -1
		// this.tracks.forEach(t => t.setAttribute('track-index', 'index:-1'))

		if (this.timeout){
			clearTimeout(this.timeout)
		}

		this.timeout = setTimeout(() => {

			if (this.data.artist === ''){
				return
			}

			const trackData = getTrackData(this.data.artist)

			const shaderFloorEntity = document.querySelector('a-entity[shader-floor]');
			if(shaderFloorEntity){
				shaderFloorEntity.setAttribute('shader-floor',`color: ${trackData.floor.color}`);
			}

			for (let i = 0; i < trackData.names.length; i++){
				const track = this.tracks[i]
				track.emit('refresh')
				track.setAttribute('track-index', `index : ${i}; length: ${trackData.names.length}`)
				track.setAttribute('player', `folder:${trackData.folder};name:${trackData.trackNames[i]}; segments: ${trackData.segments}`)
				track.setAttribute('sphere', `name: ${trackData.names[i]}; tintColor:${trackData.soundRings.startColor}`)

				track.setAttribute('sound-rings', `
					size:${trackData.soundRings.size};
					startColor:${trackData.soundRings.startColor};
					endColor:${trackData.soundRings.endColor};
				`);
			}
		}, 500)
	}
})


AFRAME.registerComponent('track-index', {
	schema : {
		index : {
			type : 'int',
			default : -1,
		},
		length : {
			type : 'int',
			default : 1,
		}
	},
	init(){
		// this.el.setAttribute('animate', 'attribute: scale; time: 300; easing: Quadratic.InOut')
	},
	update(){

		const offset = Math.PI / 4
		const segmentAngle = (Math.PI * 2 - offset) / this.data.length
		const angle = segmentAngle * (this.data.index + 0.5) + offset/2
		this.el.setAttribute('scale', '1 1 1')
		this.el.setAttribute('rotation', `0 ${angle * 180 / Math.PI} 0`)
	}
})
