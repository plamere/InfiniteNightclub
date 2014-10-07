# creates the json for the infinite nightclub
import os
import sys
import pyen
import spotipy
import json

root = 'graph'
en = pyen.Pyen()
sp = spotipy.Spotify()


def add_artists(node):
    alist = []
    node['artists'] = alist
    response = en.get('genre/artists', name=node['name'], 
        bucket=['id:spotify', 'hotttnesss'], limit=True)
    sum_hot = 0
    count = 0
    for artist in response['artists']:
        print '   ', artist['name']
        count += 1
        nartist = {
            'name' : artist['name'],
            'id' : artist['foreign_ids'][0]['foreign_id'],
            'hotttnesss' : artist['hotttnesss'],
            'tracks': []
        }
        sum_hot += artist['hotttnesss']
        add_artist_image(nartist)
        add_artist_tracks(nartist)

        if len(nartist['tracks']) > 0:
            alist.append(nartist)

    node['hotttnesss'] = sum_hot / len(response['artists'])

def get_best_image(min_width, images):
    if len(images) > 0:
        for image in reversed(images):
            if image['width'] >= min_width:
                return image
        return images[0]
    else:
        return None

def add_artist_image(nartist):
    sartist = sp.artist(nartist['id'])
    image = get_best_image(300,sartist['images'])
    if image:
        nartist['image'] = image

def add_artist_tracks(nartist):
    response = sp.artist_top_tracks(nartist['id'], country='US')
    
    for track in response['tracks']:
        ntrack = {
            'title': track['name'],
            'id': track['uri'],
            'audio': track['preview_url'],
            'image': get_best_image(300, track['album']['images'])
        }
        if ntrack['audio'] and ntrack['image']:
            nartist['tracks'].append(ntrack)

def load_genres():
    path  = os.path.join(root, 'graph.js')
    js = open(path).read()
    obj = json.loads(js)
    return obj['graph'].keys()

def populate_genre_info(g):
    genre = {
        'name' : g
    }
    add_artists(genre)
    return genre

def populate_genre(g):
    path = os.path.join(root, g + '.genre.js')
    if os.path.exists(path):
        print '   skipping', g
    else:
        genre = populate_genre_info(g)
        js = json.dumps(genre, indent=4)
        out = open(path, 'w')
        print >> out, js
        out.close()
    
if __name__ == '__main__':
    genres = load_genres()
    for i,g in enumerate(genres):
        print '%d/%d %s' % (i, len(genres), g)
        populate_genre(g)
   
