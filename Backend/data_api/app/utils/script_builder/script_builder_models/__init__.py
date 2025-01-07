import os 
import importlib

# Get the current directory's scripts
module_dir = os.path.dirname(__file__)
scripts = [f[:-3] for f in os.listdir(module_dir) if f.endswith(".py") and f != "__init__.py"]

# Dynamically import each script
for script in scripts:
    module = importlib.import_module(f".{script}", package=__name__)
    for name in dir(module):
        obj = getattr(module, name)
        if callable(obj):  # Check if it's a function
            globals()[name] = obj
