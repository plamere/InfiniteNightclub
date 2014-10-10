// Ray caster collision detection

THREE.MazeControls	= function(camera, element) {
	this.camera	= camera;
	this._element= element;
    this.thunk = loadAudio('assets/thunk2.wav');

    this.RIGHT_ARROW = 39;
    this.LEFT_ARROW=37;
    this.UP_ARROW =38;
    this.DOWN_ARROW=40;
    this.SPACE=32;
    this.PAUSE_KEY = 'P'.charCodeAt(0);
    this.UP_KEY = 'W'.charCodeAt(0);
    this.DOWN_KEY = 'S'.charCodeAt(0);
    this.LEFT_KEY = 'A'.charCodeAt(0);
    this.RIGHT_KEY = 'D'.charCodeAt(0);
    this.LOOKUP = 'U'.charCodeAt(0);
    this.MONKEY = 'M'.charCodeAt(0);
    this.FLY = 'F'.charCodeAt(0);
    this.ANIMATE = 'H'.charCodeAt(0);
    this.TOP_VIEW_KEY = 'T'.charCodeAt(0);
    this.NORMAL_VIEW_KEY = 'N'.charCodeAt(0);
    this.compass = 0;
    this.isUp = false;
    this.rotateTime = 500;
    this.normalRotateTime = 500;
    this.slowRotateTime = 2000;

    this.cameraHeight = .75;
    this.jumping = false;

    this.handlers = {}

    this.curPos = new THREE.Vector3(0,0,0);
    this.viewHalfX = window.innerWidth / 2;
    this.viewHalfY = window.innerHeight /2;
    this.sceneObjects = null;

	var _this	= this;
	this._$onKeyDown	= function(){ console.log('keydown'); _this._keyDown.apply(_this, arguments); };
	this._$clickHandler	= function(){ _this._clickHandler.apply(_this, arguments); };
    $(document).keydown( this._$onKeyDown);
    this._element.click(this._$clickHandler);

    this.monkey_keys = [
        this.UP_KEY, this.UP_KEY, this.UP_KEY, this.UP_KEY, 
        this.UP_KEY, this.UP_KEY, this.UP_KEY, this.UP_KEY, 
        this.UP_ARROW, this.UP_ARROW, this.UP_ARROW, this.UP_ARROW, 
        this.DOWN_KEY, 
        this.LEFT_ARROW, this.RIGHT_ARROW, 
        this.LEFT_ARROW, this.RIGHT_ARROW, 
        this.LEFT_KEY, this.RIGHT_KEY, 
        this.LEFT_KEY, this.RIGHT_KEY, 
        this.ANIMATE, this.FLY
    ];

}

function loadAudio(url) {
    var audio = document.createElement('audio');
    audio.setAttribute('src', url);
    return audio;
}


THREE.MazeControls.prototype._keyDown = function (event) {
    console.log('key', event);
    if (event.keyCode in this.handlers) {
        this.handlers[event.keyCode]();
    }

    if (event.keyCode == this.RIGHT_ARROW) {
        var time = 500;
        if (event.shiftKey) {
            time = 4000;
        }
        this.rotate(-1, time);
        event.preventDefault();
    }

    if (event.keyCode == this.LEFT_ARROW) {
        var time = 500;
        if (event.shiftKey) {
            time = 4000;
        }
        this.rotate(1, time);
        event.preventDefault();
    }

    if (event.keyCode == this.MONKEY) {
        if (this.monkey) {
            clearInterval(this.monkey);
            this.monkey = null;
        } else {
            var that = this;
            this.monkey = setInterval(
                function() {
                    console.log(that, that.monkey_keys);
                    key = _.sample(that.monkey_keys);
                    event.keyCode = key;
                    that._keyDown(event);
                }, 500);
        }
        event.preventDefault();
    }

    if (event.keyCode == this.UP_ARROW || event.keyCode == this.UP_KEY) {
        this.move(-1.0);
        event.preventDefault();
    }

    if (event.keyCode == this.DOWN_ARROW ||event.keyCode == this.DOWN_KEY) {
        this.move(1.0);
        event.preventDefault();
    }

    if (event.keyCode == this.LEFT_KEY) { 
        this.offAxisMove(-1.0);
        event.preventDefault();
    }

    if (event.keyCode == this.LOOKUP) { 
        this.lookup();
        event.preventDefault();
    }

    if (event.keyCode == this.RIGHT_KEY) { 
        this.offAxisMove(1.0);
        event.preventDefault();
    }

    if (event.keyCode == this.SPACE) {
        this.jump();
        event.preventDefault();
    }

    if (event.keyCode == this.FLY) {
        this.fly();
        //event.preventDefault();
    }

    if (event.keyCode == this.PAUSE_KEY) {
        stopTrack();
        event.preventDefault();
    }

    if (event.keyCode == this.ANIMATE) {
        // horrible ...
        nextAnimation(curRoom);
        event.preventDefault();
    }
}
THREE.MazeControls.prototype._clickHandler = function (e) {
    var projector = new THREE.Projector();
    var mouseVector = new THREE.Vector3();

    if (false) {
        console.log('mouse', e.offsetX, e.offsetY);
        console.log('mouse', e);
    }
    var width = this._element.width();
    var height = this._element.height();
    mouseVector.x = 2 * (e.pageX / width) - 1;
    mouseVector.y = 1 - 2 * ( e.pageY / height);

    var raycaster = projector.pickingRay( mouseVector, camera );
    var intersects = raycaster.intersectObjects( this.sceneObjects, true);
        
    if (intersects.length > 0) {
        var obj = intersects[0].object;
        while (obj) {
            if ('clicked' in obj) {
                obj.clicked();
                break;
            } else {
                obj = obj.parent;
            }
        }
    }
}

THREE.MazeControls.prototype.rotate = function(direction, time, delay) {
    delay = delay === undefined ? 0 : delay;
    this.compass += direction;
    var angle = (Math.PI / 2) * this.compass;
    var target = { x:0, y:angle, z:0};
    var camera = this.camera;

    var tween = new TWEEN.Tween(camera.rotation)
        .to(target, time)
        .onUpdate( function() {
            camera.rotation.x = this.x;
            camera.rotation.y = this.y;
            camera.rotation.z = this.z;
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .delay(delay)
        .start();
}

THREE.MazeControls.prototype.lookup = function() {
    //var camera = this.camera;
    //camera.lookAt(new THREE.Vector2(20,20,20));
}

THREE.MazeControls.prototype.frotate = function(direction) {
    this.compass = direction;
    var angle = (Math.PI / 2) * this.compass;
    this.camera.rotation.x = 0;
    this.camera.rotation.y = angle;
    this.camera.rotation.z = 0;
}

THREE.MazeControls.prototype.jump = function() {
    if (true || !this.jumping) { // FIXME
        var that = this;
        this.jumping = true;
        var starget = {  y: 5, };
        var ttarget = {  y: this.cameraHeight, };
        //var rtarget = { x: -Math.PI / 2};
        var upTween = new TWEEN.Tween(this.camera.position).to(starget, 2000)
             .easing( TWEEN.Easing.Quadratic.Out).delay(0);
        var downTween = new TWEEN.Tween(this.camera.position).to(ttarget, 3000)
             .easing( TWEEN.Easing.Bounce.Out).delay(0).
                onComplete(function(){ that.jumping = false;});
        upTween.chain(downTween);
        upTween.start();
    }
}

THREE.MazeControls.prototype.fly = function() {
    var ttarget = {  y: this.camera.position.y + 3, };
    var tween = new TWEEN.Tween(this.camera.position).to(ttarget, 2000)
         .easing( TWEEN.Easing.Quadratic.Out).delay(0);
    tween.start();
}


THREE.MazeControls.prototype.llmove = function (distance, compassOffset) {
    var scale = 1;
    var ncompass = (this.compass + compassOffset) % 4;
    var xpos = this.curPos.x;
    var ypos = this.curPos.y;
    var zpos = this.curPos.z;
    if (ncompass == 0) {
        zpos += distance;
    } else if (ncompass == 2 || ncompass == -2) {
        zpos -= distance;
    } else if (ncompass == 1 || ncompass == -3) {
        xpos += distance;
    } else if (ncompass == 3 || ncompass == -1) {
        xpos -= distance;
    }

    this.llgoPos(xpos, ypos, zpos);
}

THREE.MazeControls.prototype.hasClearPathTo = function (source, target) {
    var direction = new THREE.Vector3();
    direction.subVectors(target, source);

    var distance = direction.length();
    var near = 0;
    var far = distance;
    var raycaster = new THREE.Raycaster(source, direction, near, far);
    raycaster.precision = .01;
    var intersects = raycaster.intersectObjects(this.sceneObjects, true);

    if (intersects.length > 0) {
        var obj = intersects[0].object;
        while (obj) {
            if (obj.play) {
                break;
            } else {
                obj = obj.parent;
            }
        }
        if (obj) {
            obj.play();
        } else {
            this.thunk.play();
        }
    }
    return intersects.length == 0;
}

THREE.MazeControls.prototype.llgoPos = function (xpos, ypos, zpos, immediate) {

    var target = new THREE.Vector3(xpos + .5,ypos + this.cameraHeight, zpos + .5);
    var source = new THREE.Vector3(this.curPos.x + .5, this.curPos.y + this.cameraHeight, this.curPos.z + .5);

    var moveOK = this.hasClearPathTo(source, target);
    if (moveOK || immediate) {
        if (immediate) {
            this.camera.position.x = target.x;
            this.camera.position.y = target.y;
            this.camera.position.z = target.z;
        } else {
            new TWEEN.Tween(this.camera.position).to(target, 1000)
                 .easing( TWEEN.Easing.Quadratic.Out).start();
        }
        this.curPos.x = xpos;
        this.curPos.y = ypos;
        this.curPos.z = zpos;
    } 
}

THREE.MazeControls.prototype.offAxisMove = function (distance) {
    this.llmove(distance, 1);
}

THREE.MazeControls.prototype.move = function (distance) {
    this.llmove(distance, 0);
}

function addObjs(arry, objarry) {
    _.each(objarry, function(obj) {
        if (obj) {
            // arry.push(obj);
            if (obj.raycast) {
                arry.push(obj);
            }
            if (obj.children) {
                addObjs(arry, obj.children);
            }
        }
    });
}

THREE.MazeControls.prototype.setScene = function (viz, startingPos, angle) {
    this.sceneObjects = [];
    var angles = [2, 3, 0, 1];
    addObjs(this.sceneObjects, viz);
    this.frotate(angles[angle]);
    this.llgoPos(startingPos.x -.5, startingPos.y -.5, startingPos.z -.5, true);
}


THREE.MazeControls.prototype.addKeyPressedHandler = function(key, func) {
    var code = key.charCodeAt(0);
    this.handlers[code] = func;
}

THREE.MazeControls.prototype.update	= function(event) {
}

