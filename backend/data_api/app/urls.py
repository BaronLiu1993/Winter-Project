from django.urls import path
from .views import ExecutePipelineView

urlpatterns = [
    path('execute-pipeline/', ExecutePipelineView.as_view(), name='execute-pipeline'),
] 

#as_view() is a method that converts class-based view into a function based view that takes request and return response
#class ExecutePipelineView(View):
#    def get(self, request):
#        return HttpResponse("This handles GET requests")
#    
#    def post(self, request):
#        return HttpResponse("This handles POST requests")#

## When you use as_view() in urls.py, it's equivalent to something like this:
#def view_function(request, *args, **kwargs):
#    view_instance = ExecutePipelineView()
#    if request.method == 'GET':
#        return view_instance.get(request)
#    elif request.method == 'POST':
#        return view_instance.post(request)