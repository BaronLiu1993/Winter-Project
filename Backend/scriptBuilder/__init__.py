from webbrowser import register

from BaseScriptBuilder import BaseScriptGenerator

SCRIPT_GENERATOR_REGISTRY = {}

def register_script_type(script_type):
    """
    A decorator to register script generator subclasses.
    """
    def wrapper(cls):
        SCRIPT_GENERATOR_REGISTRY[script_type] = cls
        cls.script_type = script_type  # Attach script_type metadata to the class
        return cls
    return wrapper

@register_script_type("hello_world")
class HelloWorldScriptGenerator(BaseScriptGenerator):
    """
    A script generator for printing a greeting and adding numbers.
    Expects: {"greeting": "Hello, World!", "numbers": {"a": 1, "b": 2}}
    """
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.imports.add_import("numpy", as_name="np")

    def _raw_script(self) -> str:
        from scriptBuildersMethods.helloWorld import main as script
        return script(self)


@register_script_type("data_loader")
class DataLoaderScriptGenerator(BaseScriptGenerator):
    # not implemented yet
    pass

@register_script_type("model_builder")
class ModelBuilderScriptGenerator(BaseScriptGenerator):
    # not implemented yet
    pass