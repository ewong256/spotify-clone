from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import db
from app.models import Like, Song

like_routes = Blueprint("likes", __name__)

# GET User can see the number of likes on a song
@like_routes.route('/songs/<int:song_id>/likes', methods=['GET'])
def get_likes(song_id):
    likes = Like.query.filter_by(song_id=song_id).count()
    return jsonify({"song_id": song_id, "likes": likes})

# POST User can like a song
@like_routes.route('/songs/<int:song_id>/likes', methods=['POST'])
@login_required
def like_song(song_id):
    like_exists = Like.query.filter_by(user_id= current_user.id, song_id=song_id).first()

    if like_exists:
        return jsonify({"error_message": "User has already liked this song"}), 400

    new_like = Like(user_id=current_user.id, song_id=song_id)
    db.session.add(new_like)
    db.session.commit()

    return jsonify({"message": "User has successfully liked this song!", "song_id":song_id}), 201

# DELETE User can unlike a song
@like_routes.route('/songs/<int:song_id>/likes', methods=['DELETE'])
@login_required
def unlike_song(song_id):
    like = Like.query.filter_by(user_id=current_user.id, song_id=song_id).first()

    if not like:
        return jsonify({"error_message": "Like not found"}), 404

    db.session.delete(like)
    db.session.commit()

    return jsonify({"message": "User has successfully unliked this song", "song_id": song_id}), 200
