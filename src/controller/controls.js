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

import animitter from 'animitter';
import { isDaydream, empty, valueExists, values, is360, isMobile, pluck, diff } from 'utils/Helpers';
import { MouseControls } from './Cursor';

/**
 * all of the different possible types of controls
 */
export const types = {
	CURSOR: "cursor-controller",
	DAYDREAM: "Daydream Controller",
    //if its not the controller version (just touchpad), use retical
	GEAR: "Gear VR Controller",
	RETICAL: "retical-controller",
	VIVE: "OpenVR Gamepad",
	OCULUS_TOUCH_LEFT: "Oculus Touch (Left)",
	OCULUS_TOUCH_RIGHT: "Oculus Touch (Right)"
};


/**
 * the component names to mount for each controller type
 */
const components = {
	[types.CURSOR]: 'mouse-controller',
    [types.DAYDREAM]: 'custom-geavr-controller',
	[types.GEAR]: 'custom-gearvr-controller',
	[types.RETICAL]: 'retical-controller',
	[types.VIVE]: 'custom-six-dof-controller',
	[types.OCULUS_TOUCH_LEFT]: 'custom-six-dof-controller',
    [types.OCULUS_TOUCH_RIGHT]: 'custom-six-dof-controller'
};




export const findControllers = (target=[])=>{
	//empty if not emptied
	while(target.length){
		target.splice(0, 1);
	}

    if(!navigator.getGamepads){
        return target;
    }

    const gps = navigator.getGamepads();
    const controllerValues = values(types);

    for(let i=0; i<gps.length; i++){
        if(gps[i] === null || !gps[i].id){
            continue;
        }

        const id = gps[i].id;


        for(let j=0; j<controllerValues.length; j++){
            if(id === controllerValues[j]){
                const key = Object.keys(types)[j];

                target.push({
                	key,
					type: types[key],
                    index: i
                });
            }
        }
    }

    return target;
};


/**
 * mouse-controller component
 */
AFRAME.registerComponent('mouse-controller', {

	init: function(){
        const mouseCursor = document.createElement('a-entity');
        mouseCursor.setAttribute('mouse-cursor', true);
        document.querySelector('a-scene').appendChild(mouseCursor);
		//this.el.appendChild(mouseCursor);

        //const entity = document.createElement('a-entity')
        //document.querySelector('a-scene').appendChild(entity)
		setTimeout(()=> {
            this.el.setAttribute('ray-intersection-emitter', `
                updatePositions: true;
                front: [mouse-cursor];
                back: [camera];
                touch:${isMobile()};
            `)
        }, 10);
	}

});


/**
 * retical-controller component
 * adds the retical component to the camera and manages its intersection detection
 */
AFRAME.registerComponent('retical-controller', {

	init: function(){
	    this.id = types.RETICAL;

        const retical = document.createElement('a-entity');
        retical.id = 'retical';
        retical.setAttribute('retical', true);

		this.reticalEl = retical;

		this.cameraEl = document.querySelector('[camera]');
        this.cameraEl.appendChild(retical);

        setTimeout(()=> {
            this.el.setAttribute('ray-intersection-emitter', 'front: [retical]; back: [camera]; touch:false; updatePositions: true;')
        }, 100);
	},

	remove: function(){
		this.cameraEl.removeChild(this.reticalEl);
		this.el.removeAttribute('ray-intersection-emitter');
	}

});


/**
 * custom-gearvr-controller
 * applies to the gearvr touch controller, it combines
 * A-Frame's internal gearvr-controls component and our
 * ray-controls + ray-intersection-emitter components
 */
AFRAME.registerComponent('custom-gearvr-controller', {

	schema: {
		controller: {
            type: 'string',
            default: 'gearvr'
		}
	},

	init: function(){
		this.__emitControllerClick = this.__emitControllerClick.bind(this);
		this.id = types.GEAR;

        this.el.setAttribute(`${this.data.controller}-controls`, { hand: 'right' });
        this.el.addEventListener('triggerdown', this.__emitControllerClick);
        this.el.addEventListener('trackpaddown', this.__emitControllerClick);

        this.el.setAttribute('id', 'righthand');
        this.el.setAttribute('ray-controls', 'use: true; hand: right;');
        setTimeout(()=> {
           this.el.setAttribute('ray-intersection-emitter', 'front: .tracked-ray-front-right; back: #righthand;')
       }, 100);
	},

	remove: function(){
        this.el.removeAttribute(`${this.data.controller}-controls`);
        this.el.removeEventListener('triggerdown', this.__emitControllerClick);
        this.el.removeEventListener('trackpaddown', this.__emitControllerClick);
        this.el.setAttribute('ray-controls', 'use: false;');
        this.el.removeAttribute('ray-intersection-emitter');
	},

	__emitControllerClick(){
		this.el.emit('controller-click');
	}

});

/**
 * custom-six-dof-controller component
 * applies to both Vive and Oculus Touch controllers,
 * it will create entities within the parent node for each available controller
 */
AFRAME.registerComponent('custom-six-dof-controller', {

	schema: {
	    numberOfControllers: {
	    	type: 'number',
			default: 1
		}
	},

	init: function(){
		this.controllerEntities = [];

		for(let i=0; i<this.data.numberOfControllers.length; i++) {
			this.createController(i);
		}
	},

	update: function(){
		if(this.data.numberOfControllers > this.controllerEntities.length){
			for(let i=this.el.children.length; i<this.data.numberOfControllers; i++){
				this.createController(i);
			}
		} else {
			this.controllerEntities.forEach(entity=>
				entity.parentElement && entity.parentElement.removeChild(entity)
			);
			this.controllerEntities = [];
		}
	},

	createController: function(index){
		const hand = index === 0 ? 'left' : 'right';

		const id = `${hand}hand`;

		this.el.innerHTML += `
			<a-entity
				id="${id}"
				auto-detect-controllers="hand:${hand}"
				ray-controls="use: true; hand: ${hand};"
				cursor-component
			></a-entity>
		`;


		// a brief pause is necessary while it gets into the dom tree
		setTimeout(()=>{
			const entity = this.el.querySelector(`#${id}`);
			if(!entity){
				throw new Error("HAND DOESNT EXIST EVEN THOUGH JUST CREATED");
			}
			entity.setAttribute('ray-intersection-emitter',{
				front: `.tracked-ray-front-${hand}`,
				back: `#${id}`
			});
			this.controllerEntities.push(entity);
		}, 10);
	},

	remove: function(){
		this.controllerEntities.forEach(entity=>{
			if(entity.parentElement){
				entity.parentElement.removeChild(entity);
			}
		});
	}

});

const tmpA = [];
const tmpB = [];
const shouldGetRetical = (found)=>
    found.length === 0 && isMobile() && !is360() && !isDaydream();

const shouldGetCursor = (found)=> found.length === 0 && is360();


AFRAME.registerComponent('controls', {


	init: function() {

		this.updateControls = this.updateControls.bind(this);

        //create two instances of arrays to avoid excess garbage collection
		this.ping = [];
		this.pong = [];

		//check frequently to see if controls have changed
        this.scheduler = animitter({ fps: 2 });
        this.scheduler.on('update', this.updateControls);
        this.scheduler.start();
	},

	updateControls: function(){
        findControllers(this.pong);
        //if the controllers have changed or if whether in 360 or not has changed
        //since we are running this often, we are re-using arrays here, we call `empty()` to remove items
        //and fill the same array with the plucked values
		const changed = diff(pluck(this.ping,'type', empty(tmpA)), pluck(this.pong,'type', empty(tmpB))) ||
            (this.el.hasAttribute(components[types.RETICAL]) !== shouldGetRetical(this.pong))




		if(changed){
            console.log(`controls changed ${pluck(this.pong,'type')}`)
			//if there werent any controllers, but now there are, remove retical
			if(!this.ping.length){
			    if(this.el.hasAttribute(components[types.RETICAL])) {
                    this.el.removeAttribute(components[types.RETICAL]);
                }
                if(this.el.hasAttribute(components[types.CURSOR])){
			    	this.el.removeAttribute(components[types.CURSOR]);
				}
			}
			this.ping.forEach(controller=>
				this.el.removeAttribute(components[controller.type])
			);
		}

		//if it didnt change, there are no controllers, and retical is not already added
        if(shouldGetRetical(this.pong)) {
            this.el.setAttribute(components[types.RETICAL], true);
            return;
        } else if(shouldGetCursor(this.pong)) {
            this.el.setAttribute(components[types.CURSOR], true);
            return;
        }

        if(!changed || !this.pong.length){
        	return;
		}



		//see if its a vive
		if(this.pong[0].type === types.VIVE){
			this.el.setAttribute(components[types.VIVE], 'numberOfControllers: ' + this.pong.length);
			this.resetPingPong();
			return;
		}


		//see if its Oculus
		for(let i=0; i<this.pong.length; i++){
			const controller = this.pong[i];
			if(controller.type.indexOf("Oculus Touch") >= 0){
				this.el.setAttribute(components[types.OCULUS], 'numberOfControllers: 2');
				this.resetPingPong();
				return;
			}
		}

		for(let i=0; i<this.pong.length; i++){
			const controller = this.pong[i];
			if(controller.type === types.GEAR){
			    if(this.el.hasAttribute(components[types.RETICAL])){
			    	this.el.removeAttribute(components[types.RETICAL]);
                }
                this.el.setAttribute('custom-gearvr-controller', true);
                this.resetPingPong();
                return;
			}

		}

        for(let i=0; i<this.pong.length; i++){
            const controller = this.pong[i];
            if(controller.type === types.DAYDREAM){
                if(this.el.hasAttribute(components[types.RETICAL])){
                    this.el.removeAttribute(components[types.RETICAL]);
                }
                this.el.setAttribute('custom-gearvr-controller', 'controller: daydream');
                this.resetPingPong();
                return;
            }

        }
		this.resetPingPong();

	},

    /**
     * reset the controller arrays to freshly check for changes next time
     */
	resetPingPong(){
        this.ping = this.pong;
        this.pong = [];
	},


	update: function() {

	},

	remove: function(){
		this.scheduler.dispose();
	}


});
