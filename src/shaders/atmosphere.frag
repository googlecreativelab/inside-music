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

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define NUM_OCTAVES 5
#define TILES 75.0

varying vec2 vUv;

uniform float u_time;
uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;


float rand(float n){return fract(sin(n) * 43758.5453123);}

float fnoise(float p){
	float fl = floor(p);
	float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}


float fbm(float x) {
    float v = 0.0;
    float a = 0.5;
    float shift = float(100);
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * fnoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main(){

    float noi = mod(vUv.x * TILES, 1.0);
	float noy = mod(vUv.y * TILES, 1.0) - (smoothstep(1.0, 0.17, vUv.y) + smoothstep(0.65, 1.0, vUv.y));

    noi = step(0.15, noi);

    float v = noi * noy * 0.12;

	vec3 color = vec3(v);

	//fog
    //float depth = gl_FragCoord.z / gl_FragCoord.w;
    //float fogF = min(smoothstep(fogNear, fogFar, depth), 1.0);
    //color = mix(color, fogColor, fogF);
	gl_FragColor = vec4(color,  noi * noy);
}
