import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

FLASK_URL = "http://127.0.0.1:5000/submit-claim"  # Flask service

@api_view(["POST"])
def submit_claims(request):
    try:
        flask_response = requests.post(FLASK_URL, json=request.data)
        print(flask_response)
        return Response(flask_response.json(), status=flask_response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)