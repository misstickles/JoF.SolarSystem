from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')

@app.route('/moonRise')
def moonRise():
	return render_template('moonRise.html')