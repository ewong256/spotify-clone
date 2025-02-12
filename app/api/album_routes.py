from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import Album
from app import db

album_routes = Blueprint('albums', __name__)

# Get all albums
@album_routes.route('/', methods=['GET'])
def get_albums():
    albums = Album.query.all()
    return jsonify([album.to_dict() for album in albums])

# Get a single album by ID
@album_routes.route('/<int:album_id>', methods=['GET'])
def get_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404
    return jsonify(album.to_dict())

# Create new album
@album_routes.route('/', methods=['POST'])
@login_required
def create_album():
    data = request.get_json()

    required_fields = ["title", "user_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    new_album = Album(
        title=data['title'],
        user_id=current_user.id,
        image_url=data.get('image_url')
    )

    db.session.add(new_album)
    db.session.commit()

    return jsonify({"message": "Album successfully created!", "album": new_album.to_dict()}), 201

# Update an album
@album_routes.route('/<int:album_id>', methods=['PUT'])
@login_required
def update_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to modify this album."}), 403

    data = request.get_json()

    if 'title' in data:
        album.title = data['title']
    if 'image_url' in data:
        album.image_url = data['image_url']

    db.session.commit()
    return jsonify({"message": "Album successfully updated!", "album": album.to_dict()}), 200

# Delete an album
@album_routes.route('/<int:album_id>', methods=['DELETE'])
@login_required
def delete_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to delete this album."}), 403

    db.session.delete(album)
    db.session.commit()

    return jsonify({"message": "Album successfully deleted!"}), 200
