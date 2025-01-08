everything is in utils/script_builder

process pipeline
- returns a string of the script to be executed 

import_utils
- json files of libraries to be imported

script_builder_models
- each file represents the python script to be written for a specific node

base_script_builder
- script generator class (not to be editted)

edit_script_builder
- script generator class (to be editted)

imports
- generates the script for the imports 

topological_sort
- variety of functions that detects the inputs and outputs to nodes and the order that the nodes should be executed in

