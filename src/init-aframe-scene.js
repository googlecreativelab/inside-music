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

import 'interface/Menu'
import 'interface/PlayButton'
import 'environment/Floor'
import 'environment/sound-rings'
import 'environment/atmosphere'
import 'song/Tracks'
import 'component/Animate'
import 'controller/ray-intersection-emitter'
import 'sound/Loading'
import 'controller/controls'
import Transport from 'Tone/core/Transport'
import {getTrackData} from 'Config'


export default function initASceneController(){
	const [
		menuEl,
		sceneEl,
		tracksEl
	] = ['a-entity[menu]', 'a-scene', 'a-entity[tracks]'].map(q=>document.querySelector(q));

	sceneEl.addEventListener('enter-360', ()=>{
		document.querySelector('a-scene').classList.add('is360');
	});


	// sceneEl.addEventListener('enter-360', cFact.start360.bind(cFact));
	// sceneEl.addEventListener('enter-vr',  cFact.startVR.bind(cFact));

	menuEl.addEventListener('select', e=>{
		console.log('starting', e.detail.artist)

		tracksEl.setAttribute('tracks', {
			artist : e.detail.artist
		});

		//update all of the waveforms
		document.querySelectorAll('a-entity[track]').forEach(t => t.setAttribute('waveform', e.detail.waveform))

		// set the sky also
		document.querySelector('a-sky').setAttribute('bg-color', e.detail.color)

		// set the scene to loading
		sceneEl.setAttribute('loading', 'loader', true)
		//start the voice over
		sceneEl.setAttribute('loading', 'voiceOver', true)
	});
}
