from typing import final

from Backend.data_api.app.utils.script_builder.base_script_builder import BaseScriptGenerator
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
        return

    

class DataLoaderScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)
        self.datasetPath = payload["datasetPath"]
        self.batchSize = payload["batchSize"]
        self.shuffle = payload["shuffle"]
        self.models_used = ["data loading"]

    def _raw_script(self) -> str:
        raise NotImplementedError("DataLoaderScriptGenerator is not implemented yet.")