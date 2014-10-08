
function randomBetween(a,b) {
    var range = b - a;
    return Math.floor(Math.random() * range) + a;
}

function addStars(scene) {
    var i, r = 200, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

    for ( i = 0; i < 250; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        starsGeometry[ 0 ].vertices.push( vertex );

    }

    for ( i = 0; i < 1500; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        starsGeometry[ 1 ].vertices.push( vertex );

    }

    var stars;
    var starsMaterials = [
        new THREE.PointCloudMaterial( { color: 0xffffff, size: 2, sizeAttenuation: false } ),
        new THREE.PointCloudMaterial( { color: 0xeeeeee, size: 1, sizeAttenuation: false } ),
        new THREE.PointCloudMaterial( { color: 0xcccccc, size: 2, sizeAttenuation: false } ),
        new THREE.PointCloudMaterial( { color: 0xdddddd, size: 1, sizeAttenuation: false } ),
        new THREE.PointCloudMaterial( { color: 0xbbbbbb, size: 2, sizeAttenuation: false } ),
        new THREE.PointCloudMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
    ];

    for ( i = 10; i < 30; i ++ ) {

        stars = new THREE.PointCloud( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;

        s = i * 10;
        stars.scale.set( s, s, s );

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        scene.add( stars );

    }
}

function addLights(scene) {

/*
*/
    var ambientLight = new THREE.AmbientLight( 0x888888 );
    scene.add( ambientLight );

    var plight = new THREE.PointLight( 0xcccccc, 1, 0 );
    plight.position.set( 0, 200, 0 ).normalize();
    scene.add( plight );

/*
    var plight = new THREE.PointLight( 0xcccccc, 1, 0 );
    plight.position.set( 100, 200, 100 ).normalize();
    scene.add( plight );

    var plight = new THREE.PointLight( 0xcccccc, 1, 0 );
    plight.position.set( 100, 200, 0 ).normalize();
    scene.add( plight );

    var plight = new THREE.PointLight( 0xcccccc, 1, 0 );
    plight.position.set( 0, 200, 100 ).normalize();
    scene.add( plight );
*/


    /*
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 2);
    directionalLight.position.set( 1, 1, 0.5 ).normalize();
    scene.add( directionalLight );

    var plight2 = new THREE.PointLight( 0xffffff, 1, 0 );
    plight2.position.set( -200, 200, 200 ).normalize();
    scene.add( plight2 );

    var plight3 = new THREE.PointLight( 0xffffff, 1, 0 );
    plight2.position.set( -200, 200, -200 ).normalize();
    scene.add( plight3 );

    var plight4 = new THREE.PointLight( 0xffffff, 1, 0 );
    plight4.position.set(0, -200, 0 ).normalize();
    scene.add( plight4 );

    var dlight1 = new THREE.DirectionalLight( 0xffffff );
    dlight1.position.set( -1, -1, -1 ).normalize();
    scene.add( dlight1 );

    var dlight2 = new THREE.DirectionalLight( 0xffffff, 2 );
    dlight2.position.set( 1, 1, 1 ).normalize();
    scene.add( dlight2 );
    */
}

function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(), mat; 

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );
    var axis = new THREE.Line( geom, mat );
    return axis;
}

function normalizeAngle(angle) {
    while (angle > 2 * Math.PI) {
        angle -= Math.PI * 2;
    }
    while (angle < 0) {
        angle += Math.PI * 2;
    }
    return angle;
}


function goCircle(group, width) {
    var circumference = width * group.children.length;
    var radius = circumference / (2 * Math.PI) * 1.4;
    var theta = 0;
    var delta = 2 * Math.PI / group.children.length;

    console.log('GoCircle', group.children.length, circumference, radius);
    for (var i = 0; i < group.children.length; i++) {
        var song = group.children[i];
        var x = radius * Math.sin(theta);
        var y = 0;
        var z = radius * Math.cos(theta);

        song.rotation.x = 0;
        song.rotation.y = theta;
        song.rotation.z = 0;

        song.position.x = x;
        song.position.y = y;
        song.position.z = z;

        theta += delta;
        theta = normalizeAngle(theta);
        console.log('gc', x,y,z,theta * Math.PI * 2);

    }
}

function addAxes(scene) {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z
    scene.add(axes);
}

function moveTo(o, x, y, z, time, delay) {
    var curPos = { x: o.position.x, y:o.position.y, z:o.position.z };
    var newPos = { x: x + dither(), y:y + dither(), z:z + dither() };

    var tween = new TWEEN.Tween(curPos)
        .to(newPos, time * 1000)
        .onUpdate( function() {
            o.position.x = this.x;
            o.position.y = this.y;
            o.position.z = this.z;
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .delay(delay * 1000)
        .start();
}

function goTo(o, x, y, z) {
    o.position.x = x;
    o.position.y = y;
    o.position.z = z;
}

function rotateTo(o, x, y, z, time, delay) {
    var curPos = { x: o.rotation.x, y:o.rotation.y, z:o.rotation.z };
    var newPos = { x: x, y:y, z:z };

    var tween = new TWEEN.Tween(curPos)
        .to(newPos, time * 1000)
        .onUpdate( function() {
            o.rotation.x = this.x;
            o.rotation.y = this.y;
            o.rotation.z = this.z;
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .delay(delay * 1000)
        .start();
}

function dither() {
    return 0;
}


