from typing import final

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

INDENT: final = "    "

@register_script_type("ModelBuilder")
class ModelBuilderScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.id = payload["pipelineId"]
        self.nodes = payload["nodes"]
        self.connections = payload["connections"]

        # A map of node_id -> variable_name in the final script
        self.node_var_map = {}

    def help(self):
        print("""
        SUPPORTED MODELS (as of now ofc):
        
        - Data Loading
        - ImageAugmentation
        - NN model training
        
        """)


@register_script_type("DataLoader")
class DataLoaderScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.datasetPath = payload["datasetPath"]
        self.batchSize = payload["batchSize"]
        self.shuffle = payload["shuffle"]
        self.models_used = ["data loading"]

    def _raw_script(self) -> str:
        raise NotImplementedError("DataLoaderScriptGenerator is not implemented yet.")