from flask import Flask, render_template, request, redirect, url_for, jsonify
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
    # Check if identifier matches Ethereum address pattern
    eth_pattern = r"^0x[a-fA-F0-9]{40}$"
    if not re.match(eth_pattern, identifier):
        # Fetch the address from API using the nickname
        response = requests.get(f"https://api.cosmo.fans/user/v1/search?query={identifier}")
        data = response.json()

        # If no results or error in API, return not found
        if not data.get('results'):
            return "User not found", 404

        # Fetch the first result's address
        identifier = data['results'][0]['address']

    # Now, identifier will always be an Ethereum address
    response = requests.get(f"{COSMO_ENDPOINT}/objekt/v1/owned-by/{identifier}")
    data = response.json()

    # Assuming the API returns a list of Objekts, modify based on the actual response structure.
    objekts = data.get("objekts", [])

    return render_template('objekts.html', objekts=objekts)

@app.route('/api/search/<query>', methods=['GET'])
def api_search(query):
    response = requests.get(f"{COSMO_ENDPOINT}/user/v1/search", params={'query': query})
    if response.status_code == 200:
        return jsonify(response.json()["results"])
    return jsonify([])  # Return an empty list if the request fails

if __name__ == '__main__':
    app.run(debug=True)
