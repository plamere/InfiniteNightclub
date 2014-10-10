

var animations = [];
var animationIndex = 0;
var curAnimation = null;
var center = { x:21, y:2,  z:21}; // FIXME
var fcenter = { x:21, y:0,  z:21}; // FIXME

function addAnimation(animation) {
    animations.push(animation);
}


function stopAnimation(room) {
    if (curAnimation) {
        TWEEN.removeAll();
        curAnimation.stop(room);
        curAnimation = null;
    }
}

function nextAnimation(room) {
    stopAnimation(room);
    if (animationIndex >= animations.length) {
        animationIndex = 0;
    }
    if (animationIndex < animations.length) {
        curAnimation = animations[animationIndex++];
        curAnimation.start(room);
    }
}

function bouncer(obj, scale, count, delay) {
    if (scale == undefined) {
        scale = 1.3;
    }
    var target = { x:scale, y:scale, z:scale};
    var dest = { x:1, y: 1, z:1};
    var upTween = new TWEEN.Tween(obj.scale).to(target, 500)
             .easing( TWEEN.Easing.Sinusoidal.InOut);
    /*
    var downTween = new TWEEN.Tween(obj.scale).to(dest, 500)
             .easing( TWEEN.Easing.Sinusoidal.InOut);
    upTween.chain(downTween);
     */
    upTween.yoyo().repeat(count).start();
}

function rotator(obj, count, delay) {
    var target = { x:0, y:Math.PI, z:0};
    var dest = { x:0, y: 0, z:0};
    var tween = new TWEEN.Tween(obj.rotation).to(target, 500)
             .easing( TWEEN.Easing.Sinusoidal.InOut);
    /*
    var downTween = new TWEEN.Tween(obj.scale).to(dest, 500)
             .easing( TWEEN.Easing.Sinusoidal.InOut);
    */
    tween.yoyo();
    tween.repeat(count).delay(delay * 1000);
    tween.start();
}

function upDown(obj, distance, period, delay) {
    var curPos = { y:obj.position.y};
    var newPos = { y:obj.position.y + distance};
    var time = period / 2;
    var tween = new TWEEN.Tween(curPos)
        .to(newPos, time * 1000)
        .onUpdate( function() {
            obj.position.y = this.y;
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .repeat(1000000)
        .delay(delay * 1000)
        .start();
    return tween;
}

function addDanceAnimation() {
    var animation  = {
        name: 'dance',
        start: function(room) {
            _.each(room.floorGroup.children, function(obj, i) {
                if (i % 2 == 0) {
                    upDown(obj, 1, 1, 0);
                } else {
                    upDown(obj, 2, 2, 0);
                }
            });
            var agp = room.artistGroupHome;
            moveTo(room.artistGroup, agp[0], agp[1] + 6, agp[2], 1, 0);
        },

        stop: function(room) {
            _.each(room.floorGroup.children, function(obj, i) {
                moveTo(obj, obj.home[0], obj.home[1], obj.home[2], 1, 0);
            });
            var agp = room.artistGroupHome;
            moveTo(room.artistGroup, agp[0], agp[1], agp[2], 1, 0);
        }
    }
    return animation;
}

function goHome() {
    var animation  = {
        name: 'gohome',
        start: function(room) {
            _.each(room.alltracks, function(track, i) {
                var obj = track.cube;
                moveTo(obj, obj.home[0], obj.home[1], obj.home[2], 1, 0);
                rotateTo(obj, 0, 0, 0, 1, 0);
            });
            var agp = room.artistGroupHome;
            moveTo(room.artistGroup, agp[0], agp[1], agp[2], 1, 0);
        },

        stop: function(room) { }
    }
    return animation;
}

function makeSpiral(objects, initialRadius, padding, time, delay) {
    var radius = initialRadius;
    var cw = padding;
    var angle = 0;
    objects.forEach(function(o, i) {
        var circumference = 2 * Math.PI * 2 * (radius - cw);
        var numBlocks = circumference / cw;
        var angleDelta = 2 * Math.PI / numBlocks;
        var x = radius * Math.sin(angle);
        var y = radius * Math.cos(angle);
        angle += angleDelta;
        radius += cw / numBlocks;
        moveTo(o, fcenter.x + x, fcenter.y, fcenter.z + y, time, i * delay);
        rotateTo(o, 0, angle, 0, time, i* delay);
    });
}


function sinkFloor(room) {
    _.each(room.floorGroup.children, function(obj, i) {
        moveTo(obj, obj.home[0], obj.home[1] - 1.4, obj.home[2], 1, 0);
    });
}


function addWallDanceAnimation() {
    var animation  = {
        name: 'walldance',
        start: function(room) {
            var xs = 15, ys=1.3, zs = 15;
            var xt = 25, zt = 25;
            var x = xs;
            var y = ys;
            var z = zs;

            var agp = room.artistGroupHome;
            moveTo(room.artistGroup, agp[0], agp[1] + 8, agp[2], 2, 0);
            _.each(room.wallGroup.children, function(obj, i) {
                moveTo(obj, x, y, z, 1, 0);
                x += 2;
                if (x >= xt) {
                    x = xs;
                    z += 2
                    if (z >= zt) {
                        z = zs;
                        x = xs;
                        y += 2;
                    }
                }
            });

            sinkFloor(room);
        },

        stop: function(room) { }
    }
    return animation;
}

function addWallDanceAnimation2() {
    var animation  = {
        name: 'walldance',
        start: function(room) {
            _.each(room.wallGroup.children, function(obj, i) {
                bouncer(obj, 1.2, 1000, 0);
            });
        },

        stop: function(room) { }
    }
    return animation;
}

function makeSphere(objects, radiusFactor, center, time, delay) {
    var numObjects = objects.length;
    var radius = Math.pow(numObjects / Math.PI, 1/3);
    radius *= radiusFactor;

    _.each(objects, function(o, i) {
        var angle = 2 * Math.PI * i / numObjects;
        var x = radius * Math.sin(angle);
        var z = radius * Math.cos(angle);
        moveTo(o, center.x + x, center.y, center.z + z, time, delay);
        rotateTo(o, 0, angle, 0, time, delay);
    });
}

function makeHelix(objects, center, radius, padding, time, delay) {
    var cw = padding;
    var angle = 0;
    var circumference = 2 * Math.PI * 2 * (radius - cw);
    var z = 0;
    var numBlocks = circumference / cw;
    var heightDelta = cw/numBlocks;
    var angleDelta = Math.PI * 2 / numBlocks;

    objects.forEach(function(o, i) {
        var x = radius * Math.sin(angle);
        var y = radius * Math.cos(angle);
        angle += angleDelta;
        z += heightDelta;
        moveTo(o, center.x + x, center.y + z, center.z + y, time, i * delay);
        rotateTo(o, 0, angle, 0, time, i* delay);
    });
}

function addHelixAnimation() {
    var animation  = {
        name: 'helix',
        start: function(room) {
            makeHelix(room.wallGroup.children, center, 5, 2.5, 2, 0);
            sinkFloor(room);
            _.each(room.wallGroup.children, function(obj, i) {
                obj.update = function()  {
                    this.rotation.y += .05; 
                }
                addUpdates(obj);
            });
        },

        stop: function(room) { 
            _.each(room.wallGroup.children, function(obj, i) {
                removeUpdate(obj);
            });
        }
    }
    return animation;
}

function addTallHelixAnimation() {
    var animation  = {
        name: 'helix',
        start: function(room) {
            makeHelix(room.wallGroup.children, center, 1.8, 1.2, 2, 0);
            sinkFloor(room);
            _.each(room.wallGroup.children, function(obj, i) {
                obj.update = function()  {
                    this.rotation.y += .05; 
                }
                addUpdates(obj);
            });
        },

        stop: function(room) { 
            _.each(room.wallGroup.children, function(obj, i) {
                removeUpdate(obj);
            });
        }
    }
    return animation;
}

function addSpiralAnimation() {
    var animation  = {
        name: 'spiral',
        start: function(room) {
            makeSpiral(room.floorGroup.children, 4, 4.5, 2, 0);
            _.each(room.wallGroup.children, function(obj, i) {
                obj.update = function()  {
                    this.rotation.y += .05; 
                }
                addUpdates(obj);
            });
        },

        stop: function(room) { 
            _.each(room.wallGroup.children, function(obj, i) {
                removeUpdate(obj);
            });
        }
    }
    return animation;
}

function addReverseSpiralAnimation() {
    var animation  = {
        name: 'spiral',
        start: function(room) {
            makeSpiral(room.floorGroup.children, 4, -4.5, 2, 0);
            _.each(room.wallGroup.children, function(obj, i) {
                obj.update = function()  {
                    this.rotation.y += .05; 
                }
                addUpdates(obj);
            });
        },

        stop: function(room) { 
            _.each(room.wallGroup.children, function(obj, i) {
                removeUpdate(obj);
            });
        }
    }
    return animation;
}

function addAnimations() {
    animations.push(addSpiralAnimation());
    animations.push(addReverseSpiralAnimation());
    animations.push(addSpiralAnimation());
    animations.push(goHome());
    animations.push(addTallHelixAnimation());
    animations.push(goHome());
    animations.push(addDanceAnimation());
    animations.push(goHome());
    animations.push(addHelixAnimation());
    animations.push(goHome());
    animations.push(addWallDanceAnimation());
    animations.push(addWallDanceAnimation2());
    animations.push(goHome());
}
