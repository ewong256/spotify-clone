from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

class PlaylistForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired])
    image_url = StringField("Cover", validators=[DataRequired])
    submit = SubmitField("Submit Button")
