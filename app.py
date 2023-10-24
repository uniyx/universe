from flask import Flask, render_template, request, jsonify
import requests
import re

app = Flask(__name__)

COSMO_ENDPOINT = "https://api.cosmo.fans"

@app.route('/', methods=['GET', 'POST'])
def landing():
    users = []
    if request.method == 'POST':
        query = request.form.get('nickname')
        response = requests.get(f"{COSMO_ENDPOINT}/user/v1/search", params={'query': query})
        data = response.json()
        users = data.get("results", [])

    return render_template('landing.html', users=users)

import re

@app.route('/<identifier>')
def get_objekts(identifier):

    return render_template('objekts.html')

@app.route('/api/search/<query>', methods=['GET'])
def api_search(query):
    response = requests.get(f"{COSMO_ENDPOINT}/user/v1/search", params={'query': query})
    if response.status_code == 200:
        return jsonify(response.json()["results"])
    return jsonify([])  # Return an empty list if the request fails

if __name__ == '__main__':
    app.run(debug=True)
