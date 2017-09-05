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

import 'style/fallback.scss'
import domready from 'domready'

function sendEvent(category, action){
	if (window.googleAnalytics){
		window.googleAnalytics('send', 'event', category, action)
	}
}

const supportsWebAudio = ()=>
	!!(window.webkitAudioContext || window.AudioContext);

const supportsWebGL = ()=>{
	const c = document.createElement('canvas');
	try {
		return window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'));
	} catch(e){
		return false;
	}
};

domready(() => {
	const supported = supportsWebAudio() && supportsWebGL();
	if (!supported){
		document.querySelector('#fallback').classList.add('visible');
		sendEvent('init', 'unsupported');
	} else {
		sendEvent('init', 'supported');
	}
});

