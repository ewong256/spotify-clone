from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, URLField, SubmitField
from wtforms.validators import DataRequired, Length, URL, Optional

class SongForm(FlaskForm):
    title = StringField("Title", validators=[
        DataRequired(message="Title is required"),
        Length(max=250, message="Title cannot contain more than 250 characters")
        ])

    user_id = IntegerField("User ID", validators=[DataRequired()])

    album_id = IntegerField("Album ID", validators=[Optional()])

    song_url = URLField("Song URL", validators=[
        DataRequired(message="Song URL is required"),
        Length(max=500, message="Song URL cannot contain more than 500 characters"),
        URL(require_tld=True, message='Must be a valid URL')
        ])

    image_url = URLField("Image URL", validators=[
        DataRequired(message="Image URL is required"),
        Length(max=500, message="Image URL cannot contain more than 500 characters"),
        URL(require_tld=True, message="Must be a valid URL")
        ])

    submit = SubmitField("Upload Song")
