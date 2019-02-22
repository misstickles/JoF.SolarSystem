from flask import Flask
from flask_assets import Environment, Bundle

app = Flask(__name__)
assets = Environment(app)

# TODO: move to a config file
app.config['DEBUG'] = True
app.config['ASSETS_DEBUG'] = True

from app import views