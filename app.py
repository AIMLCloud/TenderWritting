from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def hello():

    return render_template('dashboard.html')

@app.route("/tenderProcess")
def harry():
    return render_template('tenderWritting.html')

@app.route("/bootstrap")
def bootstrap():
    return render_template('bootstrap.html')

app.run(debug=True)
