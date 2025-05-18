from rest_framework.response import Response
from rest_framework import status

def handle_serializer(serializer, *, success_status):
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=success_status)
        except Exception as e:
            print(e)
            return Response(
                {"detail": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)