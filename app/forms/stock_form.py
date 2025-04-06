from flask_wtf import FlaskForm
from wtforms import StringField, FloatField
from wtforms.validators import DataRequired

class StockForm(FlaskForm):
    symbol = StringField('Symbol', validators=[DataRequired()])
    name = StringField('Name', validators=[DataRequired()])
    current_price = FloatField('Current Price', validators=[DataRequired()])
