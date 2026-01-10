from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/submit-claim', methods=['POST'])
def submit_claim():
    data = request.json
    print("Received data:", data)

    return jsonify({
        "status": "success",
        "message": "Claim submitted!",
        "received": data
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
