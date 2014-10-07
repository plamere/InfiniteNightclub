# creates the json for the infinite nightclub

import os
import sys
import pyen
import spotipy
import json

en = pyen.Pyen()

root = 'graph'
max_genres = 1000
bad_names = ['sexy', 'christmas', 'more ']

extra_connections = {
    'pop': 'latin pop'
}

def is_bad_genre(n):
    for name in bad_names:
        if n.find(name) >= 0:
            return True
    return False

def get_genres():
    response = en.get('genre/list', results=2000)
    out = []
    for g in response['genres']:
        out.append(g['name'])
    return out

def crawl_genres(seeds):
    max_sims = 4
    min_sim_threshold = .01
    ggraph = { }
    queue = []

    def get_sims(name):
        response = en.get('genre/similar', name=name, bucket='description')
        glist = []
        if name in extra_connections:
            glist.append( (-1, extra_connections[name]) )

        for g in response['genres']:
            name = g['name']
            if is_bad_genre(name):
                continue
            if g['similarity'] > min_sim_threshold:
                if name in ggraph:
                    count = len(ggraph[name]['sims'])
                else:
                    count = 0
                glist.append( (count, name) )
            glist.sort()
        out = [ name for count, name in glist]
        return out

    def is_link_ok(g1, name):
        ok1 = True
        ok2 = True
        if name in ggraph:
            g2 = ggraph[name]
            ok1 =  g1['name'] not in g2['sims']
            ok2 = len(g2['sims']) < max_sims
        ok3 =  name not in g1['sims']
        ok4 = len(g1['sims']) < max_sims
        return ok1 and ok2 and ok3 and ok4

    def add_to_graph(genre):
        g = {
            'sims': [],
            'name': genre,
            'done': False
        }
        ggraph[genre] = g
        return g


    def get_node(genre):
        if genre in ggraph:
            return ggraph[genre]
        else:
            return add_to_graph(genre)

    for seed in seeds:
        queue.append(add_to_graph(seed))

    while len(queue) > 0 and len(ggraph) < max_genres:
        seed = queue.pop(0)
        if len(seed['sims']) >= max_sims:
            seed['done'] = True

        if not seed['done']:
            sims = get_sims(seed['name'])
            seed['done'] = True
            for s in sims:
                if is_link_ok(seed, s):
                    snode = get_node(s)
                    seed['sims'].append(snode['name'])
                    snode['sims'].append(seed['name'])
                    if len(snode['sims']) == 1:
                        queue.append(snode)
            print len(queue), len(ggraph), seed['name']
            for s in seed['sims']:
                print '  ', s
            print
    for g, n in ggraph.items():
        del n['done']
    return ggraph

def show_missing(graph):
    missing = []
    for g in get_genres():
        if not g in graph:
            missing.append(g)
    missing.sort()
    for m in missing:
        print m

def show_reachable(graph, seed):
    if seed not in graph:
        print seed, 'not in graph'
        return 
    
    queue = []
    visited = set()
    queue.append(seed)

    while len(queue) > 0:
        genre = queue.pop(0)
        if genre not in visited:
            visited.add(genre)
            for s in graph[genre]['sims']:
                queue.append(s)
    print 'reacheable from', seed, len(visited), 'of', len(graph)


if __name__ == '__main__':
    seeds = []
    seeds.extend( sys.argv[1:])
    graph = crawl_genres(seeds)
    show_reachable(graph, seeds[0])

    full = {
        'seeds': ','.join(seeds),
        'graph': graph
    }

    js = json.dumps(full, indent=4)
    path  = os.path.join(root, 'graph.js')
    out = open(path, 'w')
    print >> out, js
    out.close()
   
