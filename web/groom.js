
var rampWidth = 3;

function addFloor(grp, x, y, z, width, depth, color) {
    var texture = THREE.ImageUtils.loadTexture('assets/floor.jpg', undefined,
    function() {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 15, 15 );
        var material = new THREE.MeshLambertMaterial({ map: texture });
        var geometry = new THREE.BoxGeometry( width, .1, depth);
        var object = new THREE.Mesh( geometry, material );
        object.receiveShadow = true;
        goTo(object, x, y, z, 0, 0);
        grp.add( object );
    });
}


function addTextTile(grp, text, x, y, z, callback) {
    var widthHeightRatio = 2
    var height = 128;
    var width = Math.round(height * text.length / widthHeightRatio);
    var dynamicTexture  = new THREEx.DynamicTexture(width,height);
    var geoRatio = Math.round(width / height);

    //text = '1234567890123456789012345678901234567890';
    dynamicTexture.context.font = "bolder 72px Verdana";
    dynamicTexture.clear('#232323').drawText(text, undefined, 84, 'green')
    var geometry    = new THREE.BoxGeometry( geoRatio, 1, 1);
    var material    = new THREE.MeshLambertMaterial({ map:dynamicTexture.texture});
    var mesh    = new THREE.Mesh( geometry, material );
    goTo(mesh, x, y, z, 0, 0);
    grp.add( mesh );
    if (callback) {
        mesh.castShadow = true;
        callback(mesh);
    }
}

function addArtistTile(grp, artist, x, y, z, callback) {
    var cubeWidth = 1;
    if (artist.image) {
        var cw = cubeWidth * 5;
        var ratio = artist.image.width / artist.image.height;
        var ch = cw / ratio;
        
        var texture = THREE.ImageUtils.loadTexture('img?url=' +
            artist.image.url, undefined, function() {
                texture.flipY = true;
                var geometry = new THREE.BoxGeometry( cw, ch, .05);
                var material = new THREE.MeshLambertMaterial({ map: texture });
                var object = new THREE.Mesh( geometry, material);
                object.castShadow = true;
                goTo(object, x, y, z, 0, 0);
                grp.add(object);
                if (callback) {
                    callback(object);
                }
            }, function() {
                console.log('error loading texture');
                if (callback) {
                    callback(null);
                }
            });
    } else {
        callback(null);
    }
}

function addWall(grp, x, y, z, color) {
    var texture = THREE.ImageUtils.loadTexture('assets/blue_wall.jpg', undefined,
    function() {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1,3);
        var material = new THREE.MeshLambertMaterial({ map: texture });
        var geometry = new THREE.BoxGeometry( 1, 3, 1);
        var object = new THREE.Mesh( geometry, material );
        goTo(object, x, y, z, 0, 0);
        grp.add( object );
    });
}

function swapper(room) {
    var alltracks = _.clone(room.alltracks);
    alltracks = _.shuffle(alltracks);
    _.each(alltracks, function(track, i) {
        var tween = moveTo(track.cube, 15, i, 15, 2, i * .01 );
        tween.onComplete(function() {
            var home = track.cube.home;
            moveTo(track.cube, home[0], home[1], home[2], 2, 2 + i * .01 );
        });
    });
}


function addWalls(room, group, walls, alltracks, callback) {
    var texture = THREE.ImageUtils.loadTexture('assets/blue_wall.jpg', undefined,
    function() {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1,3);
        var material = new THREE.MeshLambertMaterial({ map: texture });
        var wallGroup = new THREE.Object3D();
        group.add(wallGroup);
        room.wallGroup = wallGroup;

        _.each(walls, function(wall, i) {
            var world = room.floorPlan.mazePosToWorld(wall);
            var geometry = new THREE.BoxGeometry( 1, 3, 1);
            var object = new THREE.Mesh( geometry, material );
            goTo(object, world.x, world.y, world.z);
            group.add( object );
            if (wall[0] % 2 == wall[1] % 2) {
                if (alltracks.length > 0) {
                    var track = alltracks.pop(0);
                    addTrackTile(wallGroup, track, world.x, world.y + .3, world.z, i,
                    function(obj) {
                        obj.home = [world.x, world.y + .3, world.z];
                        room.floorPlan.pset(wall, obj);
                        // console.log('track', obj);
                    });
                }
            }
        });
        if (callback) {
            callback();
        }
    });
}

function addClosedWall(grp, x, y, z, color) {
    var texture = THREE.ImageUtils.loadTexture('assets/blue_wall.jpg', undefined,
    function() {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
        var material = new THREE.MeshLambertMaterial({ map: texture });
        var geometry = new THREE.BoxGeometry( rampWidth, 3, rampWidth);
        var object = new THREE.Mesh( geometry, material );
        goTo(object, x, y, z, 0, 0);
        grp.add( object );
    });
}

function addClosedWall2(grp, x, y, z, color) {
    var material = new THREE.MeshLambertMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( rampWidth, 3, rampWidth);
    var object = new THREE.Mesh( geometry, material );
    goTo(object, x, y, z, 0, 0);
    grp.add( object );
    return object;
}

function addWall2(grp, x, y, z, color) {
    var material = new THREE.MeshLambertMaterial({ color: color, ambient:"#88EE88"});
    var geometry = new THREE.BoxGeometry( 1, 3, 1);
    var object = new THREE.Mesh( geometry, material );
    goTo(object, x, y, z, 0, 0);
    grp.add( object );
}

function addDoor(grp, x, y, z, color, callback) {
    var texture = THREE.ImageUtils.loadTexture('assets/door2.jpg', undefined,
    function() {
        texture.flipY = true;
        var material = new THREE.MeshLambertMaterial({ map: texture });
        var geometry = new THREE.BoxGeometry( rampWidth / 2, 2.5, rampWidth / 2);
        var object = new THREE.Mesh( geometry, material );
        goTo(object, x, .25, z, 0, 0);
        grp.add( object );
        callback(object);
    });
}

function addTardis(grp, x, z) {
    var texture = THREE.ImageUtils.loadTexture('assets/tardis.jpg');
    texture.flipY = true;
    var material = new THREE.MeshLambertMaterial({ map: texture });
    var geometry = new THREE.BoxGeometry( 1, 2, 1);
    var object = new THREE.Mesh( geometry, material );
    goTo(object, x, .05, z);
    grp.add( object );
    object.clicked = function() {
        gotoRandomRoom()
    };
    object.play = function() {
        gotoRandomRoom()
    };
    return object;
}


function addTrackCube(grp, track, x, y, z, which, callback) {
    var cubeWidth = 1;
    if (track.image) {
        var cw = cubeWidth;
        var texture = THREE.ImageUtils.loadTexture('img?url=' + track.image.url,
        undefined, function() {
            texture.flipY = true;

            var geometry = new THREE.BoxGeometry( cw, cw, cw);
            var material = new THREE.MeshLambertMaterial({ map: texture });

            var object = new THREE.Mesh( geometry, material);
            object.home = [x,y,z];
            object.track = track;
            track.cube = object;
            object.castShadow = true;
            object.clicked = function() {
                playTrack(track);
            }
            object.play = function() {
                playTrack(track);
            }
            goTo(object, x, y, z);
            grp.add(object);

            if (callback) {
                callback(object);
            }
        });
    }
}

function addTrackTile(grp, track, x, y, z, which, callback) {
    var cubeWidth = 1.3;
    if (track.image) {
        var cw = cubeWidth;
        var texture = THREE.ImageUtils.loadTexture('img?url=' + track.image.url,
        undefined, function() {
            texture.flipY = true;

            var geometry = new THREE.BoxGeometry( cw, cw, cw);
            var material = new THREE.MeshLambertMaterial({ map: texture });

            var object = new THREE.Mesh( geometry, material);
            object.track = track;
            track.cube = object;
            object.clicked = function() {
                playTrack(track);
            }
            object.play = function() {
                playTrack(track);
            }
            goTo(object, x, y, z);
            grp.add(object);

            if (callback) {
                callback(object);
            }
        });
    }
}

function createWall(width, height, color) {
    var material    = new THREE.MeshLambertMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( width, height, .01);
    var mesh  = new THREE.Mesh( geometry, material );
    return mesh;
}


function getRandomSpot(floorMap, gwidth, gheight) {
    var x = Math.floor(Math.random() * gwidth - gwidth / 2);
    var y = Math.floor(Math.random() * gheight - gheight / 2);
    return [x,y];
}

function createSimpleRoomViz(room, x, y, z, rotate) {
    var minWidth = 33;
    var maxWidth = 33;
    var minDepth = 32;
    var maxDepth = 32;
    var height = 6;

    if (true || room.floorPlan === undefined) {
        var width = randomBetween(minWidth, maxWidth);
        var depth = randomBetween(minDepth, maxDepth);
        room.floorPlan = floorPlan(width, depth);
        room.floorPlan.setWorldOffset(x,y,z);
        room.floorPlan.setRotation(rotate);
    }
    var group = new THREE.Object3D();
    var walls = room.floorPlan.getAllWalls();
    var alltracks = _.clone(room.alltracks);
    
    //console.log('walltracks', alltracks.length, walls.length, wallTracks);

    var dims = room.floorPlan.getDimensions();
    var worldDims = room.floorPlan.mazePosToWorld([dims[0]/2, dims[1]/2]);

    addWalls(room, group, walls, alltracks, function() {
        addFloor(group, worldDims.x, -1, worldDims.z, dims[0], dims[1], 'grey');

        room.floorPlan.buildRandomMaze(alltracks.length + 1);
        var reserved = room.floorPlan.getAllReserved();
        var floorGroup = new THREE.Object3D();
        group.add(floorGroup);
        room.floorGroup = floorGroup;

        _.each(alltracks, function(track, i) {
            if (reserved.length > 0) {
                var spot = reserved.pop(0);
                var world = room.floorPlan.mazePosToWorld(spot);
                addTrackCube(floorGroup, track, world.x, 0, world.z, i,
                function(obj) {
                    room.floorPlan.pset(spot, obj);
                });
            }
        });

        if (reserved.length > 0) {
            var spot = reserved.pop(0);
            var obj = addTardis(group, spot[0], spot[1]);
            room.floorPlan.pset(spot, obj);
        }
    });


    var artistGroup = new THREE.Object3D();
    var center = [Math.floor(dims[0]/2), Math.floor(dims[1]/2)];
    var count = 0;
    _.each(room.artists, function(artist, i) {
        addArtistTile(artistGroup, artist, 0,0,0, function(tile) {
           count++;
           if (count == room.artists.length) {
                goCircle(artistGroup, 5);
                addTextTile(artistGroup, room.name, 0,-3.5,0);
                goTo(artistGroup, center[0], 5, center[1], 2, 0);
           }
        });
    });

    artistGroup.update = function() {
        this.rotation.y += .001;
    };
    addUpdates(artistGroup);
    group.add(artistGroup);
    room.artistGroup = artistGroup;
    room.artistGroupHome = [center[0], 5, center[1]];

    // room.floorPlan.logMaze();

    // add labels

    if (false) {
        _.each(room.floorPlan.getDoors(), function(door, i) {
            if (i < room.sims.length) {
                var title = room.sims[i];
                addTextTile(group, title, door[0], 2, door[1], function(obj) {
                    if (i % 2 == 1) {
                        obj.rotation.y = Math.PI / 2;
                    }
                });
            }
        });
    }

    if (true) {
        _.each(room.floorPlan.getConnections(), function(door, i) {
            if (i < room.sims.length) {
                var title = room.sims[i];
                addTextTile(group, title, door[0], 3.0, door[1], function(obj) {
                    if (i % 2 == 1) {
                        obj.rotation.y = Math.PI / 2;
                    }
                });
            }
        });
    }


    // add transition triggers

    _.each(room.floorPlan.getConnections(), function(connector, i) {
        if (i < room.sims.length) {
            var obj = addDoor(group, connector[0], 0, connector[1], 'blue',
                function(obj) {
                    var name = room.sims[i];
                    room.floorPlan.pset(connector, obj);
                    obj.play = function() {
                        goToRoom(name);
                    }
                });
        } else {
            var door = connector
            var obj = addClosedWall(group, door[0], 0, door[1], 'green');
            room.floorPlan.pset(connector, obj);
        }
    });
    /*
    */
    return group;
}

function createVisualization(room, xoffset, yoffset, zoffset, rotation) {
    room.viz = createSimpleRoomViz(room, xoffset, yoffset, zoffset, rotation);
    return room.viz;
}

function deleteRoom(room) {
    if (room && room.viz != null) {
        clearUpdates();
        TWEEN.removeAll();
        var cgroup = room.viz;
        scene.remove(cgroup);
        room.viz = null;
        room.floorGroup = null;
        room.wallGroup = null;
        _.each(room.alltracks, function(track) {
            delete track.cube
        });
    }
}
