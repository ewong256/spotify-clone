from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, URLField, SubmitField
from wtforms.validators import DataRequired, Length, URL

class AlbumForm(FlaskForm):
    title = StringField("Title", validators=[
        DataRequired(message="Title for album is required"),
        Length(max=250, message="Title cannot contain more than 250 characters")
    ])

    user_id = IntegerField("User ID", validators=[DataRequired()])

    image_url = URLField("Image URL", validators=[
        Length(max=500, message="Image URL cannot contain more than 500 characters"),
        URL(require_tld=True, message="Must be a valid URL")
    ])

    submit = SubmitField("Create Album")
