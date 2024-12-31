from typing import final

from BaseScriptBuilder import BaseScriptGenerator
from constants import * # noqa

class ModelBuilderScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.id = payload["pipelineId"]
        self.nodes = payload["nodes"]
        self.connections = payload["connections"]

        # A map of node_id -> variable_name in the final script
        self.node_var_map = {}

    def _raw_script(self) -> str:
        from script_builder_models.PyTorchScriptGenerator import main as generate_script
        return generate_script(self.nodes, self.connections)

    

class DataLoaderScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.datasetPath = payload["datasetPath"]
        self.batchSize = payload["batchSize"]
        self.shuffle = payload["shuffle"]
        self.models_used = ["data loading"]

    def _raw_script(self) -> str:
        raise NotImplementedError("DataLoaderScriptGenerator is not implemented yet.")