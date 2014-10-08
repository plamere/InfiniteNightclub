
var rampWidth = 3;

function addFloor(grp, x, y, z, width, depth, color) {
    var material = new THREE.MeshLambertMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( width, .1, depth);
    var object = new THREE.Mesh( geometry, material );
    object.position.x =  0
    object.position.y = -30
    object.position.z = 0
    object.receiveShadow = true;
    goTo(object, x, y, z, 0, 0);
    grp.add( object );
}

function createSimpleFloor(width, depth, spacing, color) {
    var floor = new THREE.Object3D();
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( -width/2, 0, 0 ));
    geometry.vertices.push( new THREE.Vector3( width/2, 0, 0 ));
    var material = new THREE.LineBasicMaterial( { color: color, opacity: 1.0 } );

    for (var z = -depth / 2; z < depth / 2; z += spacing) {
        var line = new THREE.Line( geometry, material );
        line.position.z = z
        floor.add(line);
    }
    return floor;
}


function addTextTile(grp, text, x, y, z, callback) {
    var dynamicTexture  = new THREEx.DynamicTexture(768,128);
    dynamicTexture.context.font = "bolder 72px Verdana";
    dynamicTexture.clear('cyan').drawText(text, undefined, 84, 'green')
    var geometry    = new THREE.BoxGeometry( 6, 1, 1);
    var material    = new THREE.MeshLambertMaterial({ map:dynamicTexture.texture});
    var mesh    = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    goTo(mesh, x, y, z, 0, 0);
    grp.add( mesh );
    if (callback) {
        callback(mesh);
    }
}

function addArtistTile(grp, artist, x, y, z, callback) {
    var cubeWidth = 1;
    if (artist.image) {
        var cw = cubeWidth * 3;
        var ratio = artist.image.width / artist.image.height;
        var ch = cw / ratio;
        
        var texture = THREE.ImageUtils.loadTexture('img?url=' +
            artist.image.url, undefined, function() {
                texture.flipY = true;
                var geometry = new THREE.BoxGeometry( cw, ch, .01);
                var material = new THREE.MeshLambertMaterial({ map: texture });
                var object = new THREE.Mesh( geometry, material);
                object.castShadow = true;
                goTo(object, x, y, z, 0, 0);
                grp.add(object);
                if (callback) {
                    callback(object);
                }
            });
    }
}

function addBox(grp, x, y, z, color) {
    var material = new THREE.MeshLambertMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( 1, 1, 1);
    var object = new THREE.Mesh( geometry, material );
    goTo(object, x, y, z, 0, 0);
    grp.add( object );
}

function addWall(grp, x, y, z, color) {
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
    goTo(object, x, .2, z);
    grp.add( object );
    object.clicked = function() {
        gotoRandomRoom()
    };
    object.play = function() {
        gotoRandomRoom()
    };
    return object;
}

function addClosedWall(grp, x, y, z, color) {
    var material = new THREE.MeshLambertMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( rampWidth, 3, rampWidth);
    var object = new THREE.Mesh( geometry, material );
    goTo(object, x, y, z, 0, 0);
    grp.add( object );
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
    var cubeWidth = 1.5;
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

function createTestRoomViz(room) {
    var maxTracksPerRow = 20;
    var artistSpacing = 4;
    var trackSpacing = 1.5;
    var xoffset = curRoom.artists.length * artistSpacing / 2;
    var yoffset = maxTracksPerRow * trackSpacing / 2;
    var zoffset = maxTracksPerRow * trackSpacing / 2;
    var group = new THREE.Object3D();

    var whichTrack = 0;

    addTextTile(group, room.name, 0,0,0);
    _.each(room.artists, function(artist, ai) {
        addArtistTile(group, artist, ai * artistSpacing - xoffset, 0, 3.5);
        _.each(artist.tracks,function(track, ti) {
            var row = whichTrack % maxTracksPerRow;
            var col = Math.floor(whichTrack / maxTracksPerRow);
            addTrackCube(group, track, 
                row * trackSpacing - yoffset,
                col * trackSpacing + 1 , 0, ti);
            whichTrack++;
        });
    });

    return group;
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
    var minWidth = 25;
    var maxWidth = 30;
    var minDepth = 25;
    var maxDepth = 30;
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
    
    _.each(walls, function(wall, i) {
        var world = room.floorPlan.mazePosToWorld(wall);
        addWall(group, world.x, world.y, world.z, 'green');
        if (wall[0] % 2 == wall[1] % 2) {
            if (alltracks.length > 0) {
                var track = alltracks.pop();
                addTrackTile(group, track, world.x, world.y + .5, world.z);
            }
        }
    });

    var dims = room.floorPlan.getDimensions();
    var worldDims = room.floorPlan.mazePosToWorld([dims[0]/2, dims[1]/2]);
    addFloor(group, worldDims.x, -1, worldDims.z, dims[0], dims[1], 'grey');

    room.floorPlan.buildRandomMaze(alltracks.length + 1);
    var reserved = room.floorPlan.getAllReserved();

    _.each(alltracks, function(track, i) {
        if (reserved.length > 0) {
            var spot = reserved.pop(0);
            var world = room.floorPlan.mazePosToWorld(spot);
            addTrackCube(group, track, world.x, world.y, world.z, i,
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

    var artistGroup = new THREE.Object3D();
    var center = [Math.floor(dims[0]/2), Math.floor(dims[1]/2)];
    _.each(room.artists, function(artist, i) {
        addArtistTile(artistGroup, artist, 0,0,0, function() {
           if (artistGroup.children.length == room.artists.length) {
                goCircle(artistGroup, 3);
                addTextTile(artistGroup, room.name, 0,0,0);
                goTo(artistGroup, center[0], 2, center[1], 2, 0);
           }
        });
    });

    artistGroup.update = function() {
        this.rotation.y += .001;
    };
    addUpdates(artistGroup);


    group.add(artistGroup);

    // room.floorPlan.logMaze();

    // add labels

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

    _.each(room.floorPlan.getConnections(), function(door, i) {
        if (i < room.sims.length) {
            var title = room.sims[i];
            addTextTile(group, title, door[0], 2, door[1], function(obj) {
                if (i % 2 == 1) {
                    obj.rotation.y = Math.PI / 2;
                }
            });
        }
    });


    // add transition triggers

    var doors = room.floorPlan.getDoors();
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
            var door = doors[i];
            var door = connector
            var obj = addClosedWall(group, door[0], 0, door[1], 'green');
            room.floorPlan.pset(connector, obj);
        }
    });

    return group;
}

function createVisualization(room, xoffset, yoffset, zoffset, rotation) {
    room.viz = createSimpleRoomViz(room, xoffset, yoffset, zoffset, rotation);
    return room.viz;
}
