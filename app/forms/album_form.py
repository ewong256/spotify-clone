from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, FileField, SubmitField
from wtforms.validators import DataRequired, Length

class AlbumForm(FlaskForm):
    title = StringField("Title", validators=[
        DataRequired(message="Title for album is required"),
        Length(max=250, message="Title cannot contain more than 250 characters")
    ])

    user_id = IntegerField("User ID", validators=[DataRequired()])

    # Change URLField to FileField for file uploads
    image = FileField("Upload Image")

    submit = SubmitField("Create Album")
