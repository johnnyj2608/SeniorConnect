from user.authentication import _thread_locals

class ClearThreadLocalsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        _thread_locals.user = None
        return response