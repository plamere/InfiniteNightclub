
function initRoomManager() {
    var graph = null;
    var rooms = null;
    var roomCache = {};

    function populateTrackList(room) {
        if (room.alltracks == undefined) {
            room.alltracks = [];
            _.each(room.artists, function(artist, ai) {
                _.each(artist.tracks,function(track, ti) {
                    room.alltracks.push(track);
                    room.curTrackIndex = 0;
                });
            });
            _.shuffle(room.allTracks);
        }
    }

    function fetchRooms(callback) {
        if (rooms == null) {
            $.getJSON('graph/graph.js', function(data) {
                graph = data.graph;
                rooms = [];
                _.each(graph, function(room, name) {
                    rooms.push(name);
                });
                callback(rooms);
            })
        } else {
            callback(rooms);
        }
    }

    function fetchRoom(room, callback) {
        if (room in roomCache) {
            callback(roomCache[room]);
        } else {
            $.getJSON('graph/' + room + '.genre.js', function(data) {
                data.sims = graph[room].sims;
                roomCache[room] = data;
                populateTrackList(data);
                callback(roomCache[room]);
            });
        }
    }
    var interface = {
        fetchRooms:fetchRooms, 
        fetchRoom:fetchRoom 
    };
    return interface;
}
