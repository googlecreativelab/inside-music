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
import eventMap from 'event-map';


/**
 * mouse-cursor component
 * allows you to use your mouse to select menu items
 */
AFRAME.registerComponent('mouse-cursor', {

	init(){
		// let touchmoved = false
        this.mousePosition = new THREE.Vector2();
        this.camera = document.querySelector('a-scene').camera;
        // update the position of the mouse
        this.__vector = new THREE.Vector3()

        this.__removeListeners = eventMap({
            'mousemove': e=>{
                this.mousePosition.x = e.clientX;
                this.mousePosition.y = e.clientY;
            },
            'touchmove': e=>{
                if (e.touches){
                    // touchmoved = true
                    const touch = e.touches[0];
                    this.mousePosition.x = touch.clientX;
                    this.mousePosition.y = touch.clientY;
                }
            },
            'touchstart': e=>{
                if (e.touches){
                    // touchmoved = false
                    const touch = e.touches[0];
                    this.mousePosition.x = touch.clientX;
                    this.mousePosition.y = touch.clientY;
                    this.el.emit('touch-start')
                }
                this.tick();
            },
            'touchend': e=>{
                this.el.emit('touch-end');
            }
        });

        this.onContextMenu = this.onContextMenu.bind(this);
        window.addEventListener('contextmenu', this.onContextMenu);
	},

    onContextMenu(e){
        //stop the context menu
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    remove(){
        this.__removeListeners();
        window.removeEventListener('contextmenu', this.onContextMenu);
    },

	tick(){
        this.__vector.set(
            (this.mousePosition.x/window.innerWidth) * 2 - 1,
            -(this.mousePosition.y/window.innerHeight) * 2 + 1,
            0.5);

        this.__vector.unproject(this.camera);

        const cameraPosition = this.camera.getWorldPosition();
        const dir = this.__vector.sub(cameraPosition).normalize();

        const distance = 0.1;

        const pos = cameraPosition.clone().add(dir.multiplyScalar(distance));

        //this.el.object3D.position.set(pos.x, pos.y, pos.z)
        this.el.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`)
	}
})
