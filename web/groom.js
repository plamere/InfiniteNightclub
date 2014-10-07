
function addFloor(grp, width, depth, color) {
    var material = new THREE.MeshBasicMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( width, .1, depth);
    var object = new THREE.Mesh( geometry, material );
    object.position.x =  0
    object.position.y = -30
    object.position.z = 0
    moveTo(object, 0, -1, 0, 2, 0);
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

function randomOnSphere(radius) {
    var theta = Math.random() * 2 *  Math.PI;
    var phi = Math.random() * 2 *  Math.PI;
    var x = radius * Math.sin(theta) * Math.cos(phi);
    var y = radius * Math.sin(theta) * Math.sin(phi);
    var z = radius * Math.cos(theta);
    return new THREE.Vector3(x,y,z);
}

function addTextTile(grp, text, x, y, z) {
    var dynamicTexture  = new THREEx.DynamicTexture(768,128);
    dynamicTexture.context.font = "bolder 72px Verdana";
    dynamicTexture.clear('cyan').drawText(text, undefined, 84, 'green')
    var geometry    = new THREE.BoxGeometry( 6, 1, 1);
    var material    = new THREE.MeshBasicMaterial({ map:dynamicTexture.texture});
    var mesh    = new THREE.Mesh( geometry, material );
    grp.add( mesh );
}

function addArtistTile(grp, artist, x, y, z) {
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
                object.position.x = -100
                object.position.y = y
                object.position.z = z;
                moveTo(object, x, y, z, 2, 0);
                grp.add(object);
            });
    }
}

function addBox(grp, x, y, z, color) {
    var material = new THREE.MeshBasicMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( 1, 1, 1);
    var object = new THREE.Mesh( geometry, material );
    object.position.x = -100
    object.position.y = y
    object.position.z = z;
    moveTo(object, x, y, z, 2, 0);
    grp.add( object );
}

function addTrackCube(grp, track, x, y, z, which) {
    var cubeWidth = 1;
    if (track.image) {
        var cw = cubeWidth;
        var texture = THREE.ImageUtils.loadTexture('img?url=' + track.image.url,
        undefined, function() {
            texture.flipY = true;

            var geometry = new THREE.BoxGeometry( cw, cw, cw);
            var material = new THREE.MeshLambertMaterial({ map: texture });

            var object = new THREE.Mesh( geometry, material);
            var initialPos = randomOnSphere(20);
            object.position.x = initialPos.x;
            object.position.y = initialPos.y + 50;
            object.position.z = initialPos.z;
            var delay = which * 0;
            object.track = track;
            track.cube = object;
            object.clicked = function() {
                console.log('clicked on', track.title);
                playTrack(track);
            }
            moveTo(object, x, y, z, 2, delay);
            grp.add(object);
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
    var material    = new THREE.MeshBasicMaterial({ color: color});
    var geometry = new THREE.BoxGeometry( width, height, .01);
    var mesh  = new THREE.Mesh( geometry, material );
    return mesh;
}


function getRandomSpot(floorMap, gwidth, gheight) {
    var x = Math.floor(Math.random() * gwidth - gwidth / 2);
    var y = Math.floor(Math.random() * gheight - gheight / 2);
    return [x,y];
}

function createSimpleRoomViz(room) {
    var minWidth = 35;
    var maxWidth = 50;
    var minDepth = 35;
    var maxDepth = 50;
    var height = 6;

    if (room.floorPlan === undefined) {
        var width = randomBetween(minWidth, maxWidth);
        var depth = randomBetween(minDepth, maxDepth);
        room.floorPlan = floorPlan('random', width, depth, room.alltracks.length);
    }
    var group = new THREE.Object3D();
    console.log('csrv', room.alltracks.length);

    var walls = room.floorPlan.getAllWalls();
    _.each(walls, function(wall) {
        var world = room.floorPlan.mazePosToWorld(wall);
        addBox(group, world.x, world.y, world.z, 'green');
    });

    var dims = room.floorPlan.getDimensions();
    addFloor(group, dims[0], dims[1], 'grey');

    var reserved = room.floorPlan.getAllReserved();
    _.each(room.alltracks, function(track, i) {
        if (reserved.length > 0) {
            var spot = reserved.pop(0);
            var world = room.floorPlan.mazePosToWorld(spot);
            addTrackCube(group, track, world.x, world.y, world.z, i);
        }
    });

    room.floorPlan.logMaze();
    return group;
}

function createVisualization(room) {
    room.viz = createSimpleRoomViz(room);
    //room.viz = createTestRoomViz(room);
    return room.viz;
}
