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

import Listener from 'Tone/core/Listener';
import {supported} from 'Config'

AFRAME.registerComponent('listener', {
    tick() {
        if (!supported){
            return 
        }
        const object3d = this.el.object3D;
        object3d.updateMatrixWorld();
        const matrixWorld = object3d.matrixWorld;
        const position = new THREE.Vector3().setFromMatrixPosition(matrixWorld);
        Listener.setPosition(position.x, position.y, position.z);
        const mOrientation = matrixWorld.clone();
        mOrientation.setPosition({
            x: 0,
            y: 0,
            z: 0
        });
        const vFront = new THREE.Vector3(0, 0, 1);
        vFront.applyMatrix4(mOrientation);
        vFront.normalize();
        const vUp = new THREE.Vector3(0, -1, 0);
        vUp.applyMatrix4(mOrientation);
        vUp.normalize();
        Listener.setOrientation(vFront.x, vFront.y, vFront.z, vUp.x, vUp.y, vUp.z);
    }
});
