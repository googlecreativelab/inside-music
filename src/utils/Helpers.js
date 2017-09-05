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


/**
 * does the `value` exist within the given `object`
 * @type {Function}
 * @param {Object|Array} object
 * @param {*} value
 * @returns {boolean}
 */
export const valueExists = (object, value)=>
    !!Object.keys(object).filter((key)=> object[key] === value).length;

/**
 * return all of the values as an array
 * @type {Function}
 * @param {Object|Array} object
 * @returns {Array}
 */
export const values = (object)=>
    Object.keys(object).map(key=>object[key]);


/**
 * is the users experience on a mobile device
 * @type {Function}
 * @returns {boolean}
 */
export const isMobile = ()=>
    document.querySelector('a-scene').isMobile;

/**
 * determine if the device is a tablet based on its screen ratio
 * if its not close to 16:9 it wont be suitable for a headset
 * @returns {boolean}
 */
export const isTablet = ()=>
    Math.max(window.screen.width, window.screen.height) / Math.min(window.screen.width, window.screen.height) < 1.35 &&
        !(/(Oculus|Gear)/).test(navigator.userAgent);


/**
 * has the experience been entered into 360 mode
 */
export const is360 = ()=>
    document.querySelector('a-scene').classList.contains('is360');

/**
 * what is the displayName of the current VR headset?
 * null, if none
 * @returns {String}
 */
export const getHeadset = ()=> {
    const h = document.querySelector('[headset]');
    return h && h.getAttribute('headset');
};


/**
 * is the available headset daydream?
 * @returns {boolean}
 */
export const isDaydream = ()=>
    getHeadset() && getHeadset().toLowerCase().indexOf('daydream') >= 0;


/**
 * empty an array without creating a new one (for GC purposes)
 * @param arr
 * @returns {*}
 */
export const empty = (arr)=>{
    while(arr.length){
        arr.splice(0, 1);
    }
    return arr;
};

/** pluck a property out of every element in an array
 * @param arr
 * @param prop
 */
export const pluck = (arr, prop, target=[])=>{
    arr.forEach(v=>{
        target.push(v[prop]);
    });
    return target;
};

/**
 * Is there different contents in the two arrays?
 * @param a
 * @param b
 * @returns {boolean}
 */
export const diff = (a, b)=>{
    if(a.length !== b.length){
        return true;
    }

    for(let i=0; i<a.length; i++){
        if(a[i] !== b[i]){
            return true;
        }
    }

    return false;
};

export function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function getViewerType(callback){

    navigator.getVRDisplays()
    .then( function( displays ) {
        if(displays.length>0 && displays[0].isPresenting) {
            if (displays[0].stageParameters === null) {
                callback('3dof');
            } else {
                callback('6dof');
            }
        } else {
            callback('viewer');
        }
    })
    .catch( function() {
        callback('viewer');
    });

}

// redefine createElement
Document.prototype.createElementWithAttributes = function createElement(name, attrs) {

    // create the element
    var element = Document.prototype.createElement.call(this, String(name));

    // for each attribute
    for (var attr in attrs) {
        // assign the attribute, prefixing capital letters with dashes 
        element.setAttribute(attr.replace(/[A-Z]/g, '-$&'), attrs[attr]);
    }

    // return the element
    return element;
};

//nodelist polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, argument) {
        argument = argument || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(argument, this[i], i, this);
        }
    };
}


export const clamp = (val, minVal, maxVal)=>
        Math.min(maxVal, Math.max( val, minVal));

export const stringToHex = (str)=> Number(`0x${str.slice(1, str.length)}`);


export const take = ( num, fn, results=[] )=>{
    for(let i=0; i<num; i++) {
        results[i] = fn(i, num);
    }

    return results;
}

export const lerp = (v0, v1, t)=> v0*(1-t)+v1*t;

/**
 * return a random value between `min` and `max`,
 * if no params provided, range is between -1 and 1,
 * if only one param provided, the range is between `value * -1` and that `value`
 * @param {Number} [min]
 * @param {Number} [max]
 * @returns {Number}
 */
export const rand = (min, max)=>{
    if(typeof max === 'undefined'){
        if(typeof min === 'undefined'){
            min = -1;
            max = 1;
        }
        max = min;
        min = min * -1;
    }

    return Math.random() * (max-min) + min;
}

export const randVector3 = (min, max)=>
    new THREE.Vector3(
        rand(min, max),
        rand(min, max),
        rand(min, max)
    );


export const map = (value, start1, stop1, start2, stop2)=>
    start2 + (stop2 - start2) * ((value - start1) /  (stop1 - start1));

