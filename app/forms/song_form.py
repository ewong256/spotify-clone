from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, FileField, SubmitField
from wtforms.validators import DataRequired, Length, Optional

class SongForm(FlaskForm):
    title = StringField("Title", validators=[
        DataRequired(message="Title is required"),
        Length(max=250, message="Title cannot contain more than 250 characters")
    ])

    user_id = IntegerField("User ID", validators=[DataRequired()])
    album_id = IntegerField("Album ID", validators=[Optional()])

    # Change from URLField to FileField for uploads
    song = FileField("Upload Song", validators=[DataRequired(message="A song file is required")])
    image = FileField("Upload Image", validators=[Optional()])

    submit = SubmitField("Upload Song")
