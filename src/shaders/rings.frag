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

uniform vec3 color;
uniform float opacity;
uniform float amplitude;
uniform sampler2D shape;

uniform float fogNear;
uniform float fogFar;
uniform vec3 fogColor;


//  Function from Iñigo Quiles
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
	vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
							6.0)-3.0)-1.0,
					0.0,
					1.0 );
	rgb = rgb*rgb*(3.0-2.0*rgb);
	return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 rgb2hsb( in vec3 c ){
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz),
				vec4(c.gb, K.xy),
				step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r),
				vec4(c.r, p.yzx),
				step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
				d / (q.x + e),
				q.x);
}

void main() {
	vec4 texel = texture2D(shape, gl_PointCoord);

	if(texel.r == 0.0){
		discard;
	}

	vec3 c = rgb2hsb(color);
	c.g *= amplitude;
	c.b *= 0.5 + smoothstep(0.25, 1.0, amplitude);

	c = hsb2rgb(c);

	//fog
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogF = min(smoothstep(fogNear, fogFar, depth), 1.0);
    //c = mix(c, fogColor, fogF);
	c *= texel.rgb;

	//gl_FragColor = vec4(color, opacity * pow(amplitude, 2.0));
	gl_FragColor = vec4( c, opacity * texel.a);
	//gl_FragColor = vec4(1.0);
}
