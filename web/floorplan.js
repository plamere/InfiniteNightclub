// The maze manager

// floor plans are rectangles with 
// entrance ways
//

/*         1
           #      
     #############
     #############
   0#################2
     #############
     #############
           #
           3
*/

var floorPlan = function(type, r, c, npoints) {
    var maze = {}
    var rows;
    var cols;
    var rampLength = 10;
    var walkwayValue = 2;
    var connectors = [];  // E, N, W, S
    var doors = [];  // E, N, W, S
    var worldOffset =  { x:0, y:0, z:0 }
    var angle = 0;

    var WALL = '+';
    var VISITABLE = '.';
    var UNVISITABLE = ' ';
    var RESERVED  = 'o';
    var WALKWAY  = 'w';
    var DOOR = '*';

    function createMaze(type, r, c, npoints) {
        rows = r + rampLength * 2;
        cols = c + rampLength * 2;
        createBaseMaze();
        if (type == 'empty') {
        } else if (type == 'random') {
            createRandomMaze(npoints);
        } else {
            console.log('unknown maze type');
        }
        finalizeMaze();
        console.log('dims', rows, cols);
    }


    function finalizeMaze() {
        // set the walkways to visitable
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (get(row, col) === WALKWAY) {
                    set(row, col, VISITABLE);
                }
            }
        }
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var p = [row, col];
                if (isWall(p)) {
                    pset(p, WALL);
                }
            }
        }
    }

    function setWorldOffset(x,y,z) {
        worldOffset.x = x;
        worldOffset.y = y;
        worldOffset.z = z;
    }

    function getWorldOffset() {
        return worldOffset;
    }


    function createBaseMaze() {
        var rowWalkway1 = randomBetween(rampLength + 1, rows - (rampLength +1));
        var rowWalkway2 = randomBetween(rampLength + 1, rows - (rampLength +1));
        var colWalkway = randomBetween(rampLength + 1, cols - (rampLength +1));
        var colWalkway1 = randomBetween(rampLength + 1, cols - (rampLength +1));
        var colWalkway2 = randomBetween(rampLength + 1, cols - (rampLength +1));

        connectors.push( [rowWalkway1, 0] );
        connectors.push( [0, colWalkway1] );
        connectors.push( [rowWalkway2, cols - 1] );
        connectors.push( [rows - 1, colWalkway2] );

        doors.push( [rowWalkway1, rampLength] );
        doors.push( [rampLength, colWalkway1] );
        doors.push( [rowWalkway2, cols - rampLength] );
        doors.push( [rows - rampLength, colWalkway2] );

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                set(row, col, UNVISITABLE);
            }
        }

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (row == rampLength - 1 && col == colWalkway1) {
                    set(row, col, DOOR);
                }  else if (row == rows - rampLength + 1 && col == colWalkway2) {
                    set(row, col, DOOR);
                } else if (row < rampLength) {
                    if (col == colWalkway1) {
                        set(row, col, WALKWAY);
                    }
                } else if (row > rows - rampLength) {
                    if (col == colWalkway2) {
                        set(row, col, WALKWAY);
                    }
                } else if (col == rampLength -1 && row == rowWalkway1) {
                    set(row, col, DOOR);
                } else if (col == cols - rampLength  && row == rowWalkway2) {
                    set(row, col, DOOR);
                } 
                else if (col < rampLength) {
                    if (row == rowWalkway1) {
                        set(row, col, WALKWAY);
                    }
                } else if (col >= cols - rampLength) {
                    if (row == rowWalkway2) {
                        set(row, col, WALKWAY);
                    }
                } else {
                    set(row, col, VISITABLE);
                }
            }
        }
    }

    function createRandomMaze(npoints) {
        for (var i = 0; i < npoints; i++) {
            var found = false;
            var xrange = (rows - rampLength * 2) - 2;
            var yrange = (cols - rampLength * 2) - 2;
            while (!found) {
                var x = Math.floor(Math.random() * xrange) + rampLength + 1;
                var y = Math.floor(Math.random() * yrange) + rampLength + 1;
                if (get(x,y) === VISITABLE) {
                    set(x, y, RESERVED);
                    found = true;
                }
            }
        }
    }

    function showMaze(elem) {
        for (var i = 0; i < rows; i++) {
            var rdiv = $("<div>");
            var s = '';
            for (var j = 0; j < cols; j++) {
                var val =  get(i,j);
                s += val;
            }
            rdiv.text(s);
            elem.append(rdiv);
            console.log(s);
        }
    }

    function logMaze() {
        for (var i = 0; i < rows; i++) {
            var s = '';
            for (var j = 0; j < cols; j++) {
                var val =  get(i,j);
                s += val;
            }
            console.log(i, s);
        }
    }


    function pickRandomPoint() {
        return [ Math.floor(Math.random() * rows), Math.floor(Math.random() * cols) ];
    }

    function pickRandomVisitablePoint() {
        var point;
        var bail = 0;
        do {
            point = pickRandomPoint();
            if (bail++ > 10000) {
                console.log('prvp bailing out');
                break;
            }
        } while (!isVisitable(point[0], point[1]));
        return point;
    }

    // in the maze: undefined is not in the maze, true is visitable, 
    // false is unassigned wall, song is
    // assigned wall

    function get(r,c)  {
        if (r in maze) {
            return maze[r][c];
        } 
        return undefined;
    }

    function pget(point)  {
        var r = point[0];
        var c = point[1];
        return get(r,c);
    }

    function set(r,c, val) {
        if (r >= 0 && r < rows && c >=0 && c < cols) {
            if (maze[r] === undefined) {
                maze[r] = {};
            }
            maze[r][c] = val;
            return true;
        }
        return false;
    }

    function pset(point, val)  {
        var r = point[0];
        var c = point[1];
        return set(r,c, val);
    }

    function isInMaze(r,c)  {
        return get(r,c) !== undefined;
    }

    function isVisitable(r,c)  {
        var val = get(r,c);
        return val == VISITABLE || val == DOOR;
    }

    function isReserved(r,c)  {
        return get(r,c) === RESERVED;
    }

    function getReservedNeighbors(r,c, radius) {
        var results = [];
        for (var i = r - radius; i < r + radius; i++) {
            for (var j = c - radius; j < c + radius; i++) {
                if (isReserved(i, j)) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function getNeighbors(p) {
        var r = p[0];
        var c = p[1];
        var results = [];
        if (r < rows - 1) {
            results.push( [r+1, c]);
        }
        if (r > 0) {
            results.push( [r-1, c]);
        }
        if (c > 0) {
            results.push( [r, c - 1]);
        }
        if (c < cols - 1) {
            results.push( [r, c + 1]);
        }
        _.shuffle(results);
        return results;
    }

    function getUnreachableNeighbor(p) {
        var neighbors = getNeighbors(p);
        for (var i  = 0; i < neighbors.length; i++) {
            if (!isReachable(neighbors[i])) {
                return neighbors[i];
            }
        }
        return null;
    }

    function getUnreachableNeighborCount(p) {
        var count = 0;
        var neighbors = getNeighbors(p);
        for (var i  = 0; i < neighbors.length; i++) {
            if (!isReachable(neighbors[i])) {
                count++;
            }
        }
        return count;
    }

    function isWall(p) {
        return (pget(p) === UNVISITABLE) && hasVisitableNeighbor(p);
    }

    function isReachable(p) {
        var neighbors = getNeighbors(p);
        for (var i = 0; i <  neighbors.length; i++) {
            if (pget(neighbors[i]) === VISITABLE) {
                return true;
            }
        }
        return false;
    }

    function hasVisitableNeighbor(p) {
        var neighbors = getNeighbors(p);
        for (var i = 0; i <  neighbors.length; i++) {
            if (pget(neighbors[i]) === VISITABLE) {
                return true;
            }
        }
        return false;
    }

    function getAllReserved() {
        var results = [];
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                if (isReserved(i, j)) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function getAllWalls() {
        var results = [];
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                if (get(i, j) === WALL) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function getAllFloor() {
        var results = [];
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var val = get(i, j);
                if (val !== WALL && val !== UNVISITABLE) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function setRotation(rotation) {
        angle = rotation;
    }

    function mazePosToWorld(pos) {
        var mpx, mpz;

        if (angle == 0)  {
            r = pos[0];
            c = pos[1];
        }
        else if (angle == 90)  {
            c = cols - pos[0];
            r = pos[1];
        } else if (angle == 180)  {
            r = rows - pos[0];
            c = cols - pos[1];
        } else if (angle == 270) {
            c = pos[0];
            r = rows - pos[1];
        }

        return {
            x: r +  worldOffset.x, 
            y: 0 +  worldOffset.y, 
            z: c +  worldOffset.z
        };
    }

    function worldPosToMaze(pos) {
        var r = Math.floor(pos.x - worldOffset.x)
        var c = Math.floor(pos.z - worldOffset.z)

        var pos = [];
        if (angle == 0)  {
            pos[0] = r;
            pos[1] = c;
        }
        else if (angle == 90)  {
            pos[0] = cols - c;
            pos[1] = r;
        } else if (angle == 180)  {
            pos[0] = rows - r;
            pos[1] = cols - c;
        } else if (angle == 270) {
            pos[0] = c;
            pos[1] = rows - r;
        }
        return pos;
    }

    function getStartingPoint(which) {
        return connectors[which];
    }

    function getConnections() {
        return connectors;
    }

    function getDoors() {
        return doors;
    }

    createMaze(type, r, c, npoints);

    return {
        get:get,
        set:set,
        pset:pset,
        pget:pget,
        show:showMaze,
        logMaze:logMaze,
        isInMaze: isInMaze,
        isVisitable: isVisitable,
        isReserved: isReserved,
        getReservedNeighbors: getReservedNeighbors,
        getAllReserved: getAllReserved,
        mazePosToWorld: mazePosToWorld,
        worldPosToMaze: worldPosToMaze,
        getStartingPoint: getStartingPoint,
        getConnections: getConnections,
        getDoors: getDoors,
        setRotation: setRotation,
        setWorldOffset: setWorldOffset,
        getWorldOffset: getWorldOffset,
        getAllWalls: getAllWalls,
        getAllFloor: getAllFloor,
        getDimensions: function() {
            return [rows + 1, cols + 1];
        }
    };
}



