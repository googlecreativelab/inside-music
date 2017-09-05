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

#define OFF_COLOR vec3(0.5, 237.0/255.0/2.0, 198.0/255.0/2.0)
uniform float opacity;
uniform vec3 tintColor;
uniform float mixRate;
uniform int enabled;

uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;

varying vec2 vUv;

void main(){
	float shadeX = abs(vUv.x * 2. - 1.);
	float shadeY = abs(vUv.y * 2. - 1.);
	vec4 color = vec4(1.0);
	if(enabled == 1){
		//gl_FragColor = vec4(tintColor * shadeX * shadeY + 0.66 * mixRate, opacity);

		color = vec4(mix(tintColor, vec3(1.0) * (smoothstep(0.4, 1.0, mixRate) + 0.9), smoothstep(0.0, 0.7 * mixRate, smoothstep(0.0, 0.95, vUv.y))) * (shadeX * shadeY + 0.66), 1.0);
		//color = vec4(mix(vec3(1.0), tintColor * (smoothstep(0.4, 1.0, mixRate) + 0.9), smoothstep(0.0, 0.9 * mixRate, vUv.y)) * (shadeX * shadeY + 0.66), 1.0);
	} else {
		color = vec4(OFF_COLOR * shadeX * shadeY, opacity);
	}


	//fog
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogF = min(smoothstep(fogNear, fogFar, depth), 1.0);
    color.rgb = mix(color.rgb * 1.1, fogColor, fogF);

	gl_FragColor = color;
}
