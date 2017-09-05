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

precision mediump float;

#define TWO_PI 6.28318530718

attribute float reference;

// this is a raw shader material
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float size;
uniform float waveform[WAVEFORM_RESOLUTION];
uniform float amplitude;
uniform float radius;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float fnoise(float p){
	float fl = floor(p);
	float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

void main() {

	float ref = reference * float(WAVEFORM_RESOLUTION);

	float angle = ((ref+1.)/float(WAVEFORM_RESOLUTION)) * 6.28318530718;
	vec3 pos = vec3( cos(angle), 0.0, sin(angle) );
	float offset = waveform[int(ref)] * amplitude;

	pos *= radius + offset * 0.5 + (amplitude * 0.165); //smoothstep(0.7, 1.0, amplitude)

	//pos = position;


	vec4 mvPosition = modelViewMatrix * vec4( pos.x, pos.y + offset, pos.z, 1.0 );


	// Apply Size Attenuation (make smaller when further)
	gl_PointSize = size * (1.0 / length( mvPosition.xyz ));

	gl_Position = projectionMatrix * mvPosition;

}
