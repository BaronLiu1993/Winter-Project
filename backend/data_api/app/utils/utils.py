import collections

class PyTorchScriptGenerator:
    def __init__(self, nodes, connections):
        """
        Initialize with the pipeline payload (the JSON/dict structure).
        """
        
        self.nodes = nodes
        self.connections = connections
        
        # A map of node_id -> variable_name in the final script
        self.node_var_map = {}
        self.script_lines = []
        
    def generate_script(self):
        """
        Main method to generate the Python script (as a string).
        Steps:
          1) Perform topological sort on the pipeline graph
          2) For each node in sorted order, generate code
          3) Return the final script as a string
        """
        # Build adjacency lists and in-degree counts for topological sort
        adjacency_list, in_degrees = self._build_graph()
        
        # Perform topological sort
        sorted_nodes = self._topological_sort(adjacency_list, in_degrees)
        
        # Build the script
        indent = "    "
        self._add_imports()
        self.script_lines.append("")
        self.script_lines.append("def main():")
        self.script_lines.append(f"{indent}device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')")
        self.script_lines.append("")
        
        # For each node in topological order, generate code
        for node_id in sorted_nodes:
            node = self.nodes[node_id]
            node_type = node["type"]
            node_data = node["data"]
            
            # We figure out all of this node’s upstream connections
            # so we know which variables to pass in as input(s).
            input_vars = self._get_input_vars(node_id)
            
            node_var_name = f"{node_type.lower()}_{node_id}"  # e.g., dataloader_node1
            self.node_var_map[node_id] = node_var_name
            
            # Generate the code lines for this node
            node_code_lines = self._generate_node_code(
                node_type=node_type,
                node_var=node_var_name,
                node_data=node_data,
                input_vars=input_vars,
                indent=indent
            )
            
            # Add them to the script
            self.script_lines.extend(node_code_lines)
        
        self.script_lines.append(f"{indent}print('Pipeline execution complete.')")
        
        # End of main()
        self.script_lines.append("")
        self.script_lines.append("if __name__ == '__main__':")
        self.script_lines.append("    main()")
        
        return "\n".join(self.script_lines)
    
    def _build_graph(self):
        """
        Build adjacency list and in-degree map from the connections in the payload.
        Returns (adjacency_list, in_degrees).
        adjacency_list[node_id] = [list of downstream node_ids]
        in_degrees[node_id] = count of how many edges lead into node_id
        """
        adjacency_list = {nid: [] for nid in self.nodes}
        in_degrees = {nid: 0 for nid in self.nodes}
        
        for conn_id, conn_info in self.connections.items():
            src = conn_info["sourceNodeId"]
            tgt = conn_info["targetNodeId"]
            adjacency_list[src].append(tgt)
            in_degrees[tgt] += 1
        
        return adjacency_list, in_degrees
    
    def _topological_sort(self, adjacency_list, in_degrees):
        """
        Standard Kahn’s Algorithm for topological sort.
        Returns a list of node_ids in topologically sorted order.
        """
        # Collect nodes with in_degree = 0
        queue = collections.deque([n for n in in_degrees if in_degrees[n] == 0])
        sorted_order = []
        
        while queue:
            node_id = queue.popleft()
            sorted_order.append(node_id)
            for child_id in adjacency_list[node_id]:
                in_degrees[child_id] -= 1
                if in_degrees[child_id] == 0:
                    queue.append(child_id)
        
        if len(sorted_order) != len(self.nodes):
            raise ValueError("Graph has a cycle or missing nodes. Cannot do topological sort.")
        return sorted_order
    
    def _get_input_vars(self, node_id):
        """
        Find all the upstream connections feeding into node_id.
        Return a list of sourceNodeId (the outputs of upstream nodes).
        """
        input_vars = []
        for conn_info in self.connections.values():
            if conn_info["targetNodeId"] == node_id:
                source_id = conn_info["sourceNodeId"]
                # The variable name for that source node
                var_name = self.node_var_map.get(source_id, None)
                if var_name:
                    input_vars.append(var_name)
        return input_vars
    
    def _generate_node_code(self, node_type, node_var, node_data, input_vars, indent):
        from backend.data_api.app.utils.scripting_tools.scripting_tool import dataloader_writer, image_augmentation_writer, trainer_writer
        """
        Generate code lines for a single node, given:
         - node_type (e.g. "DataLoader", "ImageAugmentation", "ModelTraining", etc.)
         - node_var (the Python variable name to assign)
         - node_data (the dict of config)
         - input_vars (list of variable names from upstream nodes)
         - indent (string for indentation)
         
        Returns a list of code lines.
        """
        lines = []
        
        if node_type == "DataLoader":
            dataset_path = node_data.get("datasetPath", "/path/to/dataset")
            batch_size = node_data.get("batchSize", 32)
            shuffle = node_data.get("shuffle", True)
            dataloader_writer(lines, node_var, dataset_path, batch_size, shuffle)
        
        elif node_type == "ImageAugmentation":
            rotation = node_data.get("rotation", 0)
            flip = node_data.get("flip", False)
            brightness = node_data.get("brightness", 0.0)
            crop = node_data.get("crop", None)
            
            # We expect 1 input (the DataLoader from upstream). If multiple, you'd adapt logic.
            input_loader_var = input_vars[0] if len(input_vars) > 0 else "None"
            image_augmentation_writer(lines, node_var, rotation, flip, brightness, crop, input_loader_var)

        
        elif node_type == "ModelTraining":
            
            # Then we build a model, train it using that DataLoader.
            model_type = node_data.get("modelType", "resnet50")
            learning_rate = node_data.get("learningRate", 0.001)
            epochs = node_data.get("epochs", 10)
            optimizer_config = node_data.get("optimizerConfig", {})
            optimizer_type = optimizer_config.get("type", "adam").lower()
            beta1 = optimizer_config.get("beta1", 0.9)
            beta2 = optimizer_config.get("beta2", 0.999)
            momentum = optimizer_config.get("momentum", 0.9)
            input_loader_var = input_vars[0] if len(input_vars) > 0 else "None"
            trainer_writer(lines, node_var, input_loader_var, model_type, learning_rate, epochs, optimizer_type, beta1, beta2, momentum)

        elif node_type == "ModelBuilding":
            input_loader_var 
            pass

        else:
            # Unknown node type: you’d handle other logic here
            lines.append(f"{indent}# Node: {node_type} (unhandled)")
            lines.append(f"{indent}# TODO: Implement code generation for this node type.")
            lines.append(f"{indent}{node_var} = None")
            lines.append("")
        
        return lines
    
    def _add_imports(self):
        """
        Add import statements at the top of the script.
        """
        self.script_lines.append("import torch")
        self.script_lines.append("import torch.nn as nn")
        self.script_lines.append("import torch.optim as optim")
        self.script_lines.append("import torchvision")
        self.script_lines.append("import torchvision.transforms as transforms")
        self.script_lines.append("from torch.utils.data import DataLoader")
        self.script_lines.append("from torchvision.datasets import ImageFolder")
        self.script_lines.append("")
        self.script_lines.append("")


def process_pipeline(data):
    """Process the pipeline data and return counts"""
    try:
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])

        generator = PyTorchScriptGenerator(nodes, connections)
        script_string = generator.generate_script()

        return script_string

        return {
            'status': 'success',
            'counts': {
                'nodes': len(nodes),
                'connections': len(connections)
            },
            'message': f'Received {len(nodes)} nodes and {len(connections)} connections'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }