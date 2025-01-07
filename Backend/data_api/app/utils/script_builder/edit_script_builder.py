from typing import final

from base_script_builder import BaseScriptGenerator
from Backend.data_api.app.utils.script_builder.script_builder_models import *
from constants import * 

BLOCK_SCRIPT_MAP = {"": lambda: function1(),
                    }

class EditScriptGenerator(BaseScriptGenerator):
    def __init__(self, payload: dict):
        super().__init__(payload)

    def _raw_script(self, node_type, node_data, node_var, input_vars) -> str:
        script = BLOCK_SCRIPT_MAP[node_type](node_data, node_var, input_vars)
        return script

    
