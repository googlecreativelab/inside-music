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

import {take, map, clamp} from 'utils/Helpers'
import * as ring from '../environment/rings'
import AudioBuffer from 'Tone/core/Buffer'
import animitter from 'animitter'
import eventMap from 'event-map'
import ease from 'eases/expo-in-out';


require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/UnrealBloomPass');
require('three/examples/js/shaders/ConvolutionShader');
require('three/examples/js/shaders/LuminosityHighPassShader');
require('three/examples/js/shaders/CopyShader');


//song_exploder_intro.[mp3|ogg]', buffer =>
//returns a Promise which resolves with an array
const getBuffer = () =>
    new Promise(resolve => {
        AudioBuffer.load('./audio/perfume_genius/MBIRA-0.[mp3|ogg]', buffer =>
            resolve(buffer.getChannelData(0))
        )
    });


export class SplashScene {
    constructor(canvas) {

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.001, 10000)
        camera.position.set(0, -10, 0)
        camera.lookAt(new THREE.Vector3(0, 0, 0))
        const renderer = new THREE.WebGLRenderer({canvas})
        renderer.setClearColor(0x00, 1)
        renderer.setSize(window.innerWidth, window.innerHeight)


        ring.geometryPool.clear();


        const rings = take(96, (i, len) =>
            new ring.RingPoints(
                {
                    radius: i * 0.05 + 0.5,
                    resolution: 120,
                    color: new THREE.Color(0x00ff00).setHSL(i / len, 1, 0.75),
                    opacity: Math.min(1, map(len - i, len, 1, 4.0, 0.3)),
                    //opacity: 1.0,
                    size: 38.0,
                    transparent: true,
                    //blending: THREE.AdditiveBlending
                }
            )
        );


        rings.forEach(r => r.rotateX(-Math.PI / 2.5))
        window.rings = rings;


        const waveforms = rings.map((r) => new Float32Array(128));

        const copyAndGetAverage = (source, target, start, length) => {
            let avg = 0;
            for (let i = 0; i < length; i++) {
                //target[i] = Math.random();
                target[i] = source[start + i];
                avg += target[i];
            }

            return avg / length;
        }


        let avg = 0;

        this.loop = animitter(function (delta, elapsed, frameCount) {
            const wf = waveforms.pop();

            const nextAvg = copyAndGetAverage(channelData, wf, (channelDataOffset += 128) % channelData.length, 128);

            if (!isNaN(nextAvg)) {
                avg = Math.max(avg, avg + (nextAvg - avg) * 0.3);
            }

            //scale the strength based on the num pixels in the window
            const screenSize = clamp((window.innerWidth * window.innerHeight) / 1764000, 0.5, 3);
            bloomPass.strength = map(avg, -1, 1, 0.5, 1.0) * screenSize;

            waveforms.unshift(wf);

            rings.forEach((ring, i) => {
                ring.material.uniforms.waveform.value = waveforms[i];
            });
            renderer.render(scene, camera)
            //composer.render();
        });


        this.loop.on('update', function transitionRings(delta, elapsed) {
            const t = clamp((elapsed - 500) / 8000, 0, 1);

            for (let i = 0; i < rings.length; i++) {
                rings[i].transitionStep(ease(t));
            }

            if (t >= 1.0) {
                this.removeListener('update', transitionRings);
            }
        });


        this.__removeListeners = ((self) => {
            let goal = rings[0].rotation.x;
            let lastY = 0;

            const rotationRange = {
                start: rings[0].rotation.x,
                min: rings[0].rotation.x - Math.PI / 12,
                max: rings[0].rotation.x + Math.PI / 12
            };


            const getY = (e) =>
                e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;


            const onDrag = (e) => {
                const y = getY(e);
                //const delta = y - (lastY||y);
                //goal = clamp(goal + (delta / window.innerHeight), rotationRange.min, rotationRange.max)
                goal = map(y, 0, window.innerHeight, rotationRange.min, rotationRange.max);
                lastY = y;
            }


            //make the tilting effect very subtle at the beginning
            const ramp = (elapsed, duration, minOut = 0, maxOut = 0.005) =>
                clamp(
                    map(elapsed, 0, duration, minOut, maxOut),
                    minOut,
                    maxOut
                );

            this.loop.on('update', (delta, elapsed) => {
                const diff = (goal - rings[0].rotation.x) * ramp(elapsed, 10000);
                rings.forEach(r =>
                    r.rotation.x += diff
                );
            });


            /*return eventMap({
             'touchstart canvas': (e)=> e.preventDefault(),
             'touchmove': onDrag,
             'mousemove': onDrag
             })*/
        })(this);

        let channelDataOffset = 0;
        let channelData = [];
        getBuffer()
            .then(cd => {
                channelData = cd;
                waveforms.forEach((wf, i) =>
                    copyAndGetAverage(channelData, wf, (channelDataOffset = 128 * i), 128)
                );

            });

        const composer = new THREE.EffectComposer(renderer);

        composer.setSize(window.innerWidth, window.innerHeight);

        const renderScene = new THREE.RenderPass(scene, camera);
        composer.addPass(renderScene);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, //strength
            0.8, //radius
            0.4 //threshold
        );

        composer.addPass(bloomPass);
        const copyShader = new THREE.ShaderPass(THREE.CopyShader);
        copyShader.renderToScreen = true;
        composer.addPass(copyShader);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        window.bloom = bloomPass;


        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
            bloomPass.resolution.set(window.innerWidth, window.innerHeight);
        })


        //rings.forEach(r=> r.rotateY(Math.PI * 0.5))
        rings.forEach(r => scene.add(r));
        rings.forEach(r => r.material.uniforms.amplitude.value = 1.2);
        rings.forEach(r => r.transitionStep(0));


    }

    start() {
        this.loop.start();
        return this;
    }

    stop() {
        this.loop.stop();
        return this;
    }

    close() {
        //do teardown stuff in here
        this.stop();
        this.loop.reset();
        //this.__removeListeners();
    }

}
