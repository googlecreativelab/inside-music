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

#define BLUE_HSB vec3(190.0/360.0, 90.0/100.0, 96.0/100.0)
#define BLUE_RGB vec3(24.0/255.0, 210.0/255.0, 246.0/255.0)
#define PINK_HSB vec3(312.0/360.0, 1.0, 1.0)
#define PINK_RGB vec3(1.0, 0.0, 205.0/255.0)

uniform vec3 u_startColor;
uniform vec3 u_endColor;
uniform vec3 u_diffuseColor;
uniform float u_num;
uniform float u_time;
uniform float u_amplitudes[10];
uniform int u_active[10];
uniform float u_fade;
uniform sampler2D u_normalMap;
uniform sampler2D u_specularMap;

uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;

varying vec2 vUv;

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

float circle( vec2 pos, float r ){
	vec2 center = vec2(0.0);
	float l = length(pos - center);

	l = step(r, l);
	l = 1.0 - l;

	return l;
}


float smoothcircle( vec2 pos, float r ){
	vec2 center = vec2(0.0);
	float l = length(pos - center);

	l = smoothstep(0.0, r, l);
	l = 1.0 - l;

	return l;
}


void main(){

	int N = int(u_num);
	float radius = 0.4;

	float radialGap = TWO_PI / 8.0;
	float rotationOffset = -TWO_PI / 8.0;

	vec2 uv = vUv;

	vec2 pos = uv * 2.0 - 1.0;
	vec4 texel = texture2D(u_normalMap, uv);
	pos += (texel.gb * 2. - 1.) * 0.05;

	//this offset is to matc the spheres positioning above it
	pos.y -= 0.05;

	float dist = length(pos);
	float angle = atan(pos.y, pos.x);

	float blue = 0.0;
	float orb = 0.0;

	float amplitude = 0.0;

	for(int index=0; index<10; index++){
		if(index >= N){
			break;
		}
		if(u_active[index] == 0){
			continue;
		}
		float angle = (TWO_PI - radialGap) / 7.0 * float(index);
		angle += rotationOffset;

		vec2 off = vec2(cos(angle), sin(angle));
		off *= radius;

		blue += smoothcircle(pos + off, 0.3 * u_amplitudes[index]);
		//blue *= 1.0 - smoothstep(0.1, 0.3, blue);
		//the orb should get slightly smaller with more amplitude cause its raising
		amplitude = u_amplitudes[index];
		orb += smoothstep(0.1, 0.8, smoothcircle(pos + off, 0.1 - (amplitude * 0.06)));
		if(orb > 0.0){
			//we've already found the one for this frag
			break;
		}
	}


	vec3 color = vec3(mix(u_endColor, u_startColor, blue)) * blue;
	// mix the orb with the start color
	//color += mix(u_startColor, vec3(1.0), amplitude) * orb * 0.66;
	//or keep it white
	color += orb * 0.66;
	color *= u_fade;
	float fadeFromCenter = (1.0 - smoothstep(0.0, 0.4, length(pos)));
	color += u_diffuseColor * fadeFromCenter;

	color *= texel.r;
	//color += texture2D(u_specularMap, uv).rgb * 0.05;

	//fog
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogF = min(smoothstep(fogNear, fogFar, depth), 1.0);
    color = mix(color, fogColor, fogF);

	//color += vec3(0.02);
	//color = mix(color, vec3(0.5, 0.5, 0.5), 1.0 - orb);

	gl_FragColor = vec4(color,1.0);
	//gl_FragColor = vec4(mix(mix(PINK_RGB, BLUE_RGB, blue), vec3(1.0), orb) * blue, 1.0);
}
