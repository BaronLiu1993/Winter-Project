import collections


class PyTorchScriptGenerator:
    def __init__(self, pipeline_payload):
        """
        Initialize with the pipeline payload (the JSON/dict structure).
        """
        self.payload = pipeline_payload

        # Easy references
        self.id = pipeline_payload["pipelineId"]
        self.nodes = pipeline_payload["nodes"]
        self.connections = pipeline_payload["connections"]

        # A map of node_id -> variable_name in the final script
        self.node_var_map = {}

        # generated script lines
        self.script_lines = []

    def generate_script(self):
        """
        Main method to generate the Python script (as a string).
        Steps:
          1) Perform topological sort on the pipeline graph
          2) For each node in sorted order, generate code
          3) Return the final script as a string
        """
        # 1) Build adjacency lists and in-degree counts for topological sort
        adjacency_list, in_degrees = self._build_graph()

        # 2) Perform topological sort
        sorted_nodes = self._topological_sort(adjacency_list, in_degrees)

        # 3) Build the script
        self._add_imports()

        # We’ll define a main() function so the code can be run easily
        self.script_lines.append("")
        self.script_lines.append("def main():")

        indent = "    "

        # Initialize device assignment
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

            # Decide what code to generate based on node_type
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

    # --------------------------------------------------------------------------
    # INTERNAL HELPER METHODS
    # --------------------------------------------------------------------------

    def _build_graph(self):
        """
        Build adjacency list and in-degree map from the connections in the payload.
        Returns (adjacency_list, in_degrees).
        adjacency_list[node_id] = [list of downstream node_ids]
        in_degrees[node_id] = count of how many edges lead into node_id
        """
        adjacency_list = {nid: [] for nid in self.nodes}
        in_degrees = {nid: 0 for nid in self.nodes}

        # connections:
        #   "conn1": {
        #       "sourceNodeId": "node1",
        #       "sourcePortId": "output",
        #       "targetNodeId": "node2",
        #       "targetPortId": "input"
        #   }
        for conn_id, conn_info in self.connections.items():
            src = conn_info["sourceNodeId"]
            tgt = conn_info["targetNodeId"]
            # Build adjacency
            adjacency_list[src].append(tgt)
            # Increase in-degree
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
            # Decrease in-degree for children
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
        Return a list of variable names (the outputs of upstream nodes).

        For simplicity, we’ll assume each node might have multiple upstreams,
        but typically you'd handle how to fuse them in code.
        In a basic scenario, you might have only 1 upstream for a given node type.
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
            # We assume this node produces a dataset + DataLoader
            dataset_path = node_data.get("datasetPath", "/path/to/dataset")
            batch_size = node_data.get("batchSize", 32)
            shuffle = node_data.get("shuffle", True)

            # Let’s assume a single DataLoader output.
            # Optionally, we might also produce dataset as well.

            lines.append(f"{indent}# Node: DataLoader {node_var}")
            lines.append(f"{indent}dataset_path = r'{dataset_path}'")
            lines.append(f"{indent}batch_size = {batch_size}")
            lines.append(f"{indent}shuffle = {shuffle}")
            lines.append(f"{indent}base_transform = transforms.Compose([")
            lines.append(f"{indent}    transforms.Resize((224, 224)),")
            lines.append(f"{indent}    transforms.ToTensor()")
            lines.append(f"{indent}])")
            lines.append(f"{indent}temp_dataset = ImageFolder(root=dataset_path, transform=base_transform)")
            lines.append(f"{indent}{node_var} = DataLoader(temp_dataset, batch_size=batch_size, shuffle=shuffle)")
            lines.append("")

        elif node_type == "ImageAugmentation":
            # The input might be a DataLoader from upstream.
            # We'll take the dataset from that DataLoader, apply augmentation transforms, and re-wrap.
            rotation = node_data.get("rotation", 0)
            flip = node_data.get("flip", False)
            brightness = node_data.get("brightness", 0.0)

            # We expect 1 input (the DataLoader from upstream). If multiple, you'd adapt logic.
            input_loader_var = input_vars[0] if len(input_vars) > 0 else "None"

            lines.append(f"{indent}# Node: ImageAugmentation {node_var}")
            lines.append(f"{indent}aug_transforms = []")
            if rotation > 0:
                lines.append(f"{indent}aug_transforms.append(transforms.RandomRotation({rotation}))")
            if flip:
                lines.append(f"{indent}aug_transforms.append(transforms.RandomHorizontalFlip())")
            if brightness > 0:
                lines.append(f"{indent}aug_transforms.append(transforms.ColorJitter(brightness={brightness}))")
            lines.append(f"{indent}aug_transforms.append(transforms.Resize((224, 224)))")
            lines.append(f"{indent}aug_transforms.append(transforms.ToTensor())")
            lines.append(f"{indent}augmentation_transform = transforms.Compose(aug_transforms)")
            lines.append("")
            lines.append(f"{indent}# Extract dataset from the upstream DataLoader")
            lines.append(f"{indent}upstream_dataset = {input_loader_var}.dataset")
            lines.append(f"{indent}upstream_dataset.transform = augmentation_transform")
            lines.append("")
            lines.append(f"{indent}{node_var} = DataLoader(upstream_dataset,")
            lines.append(f"{indent}    batch_size={input_loader_var}.batch_size,")
            lines.append(f"{indent}    shuffle={input_loader_var}.batch_sampler.shuffle)")
            lines.append("")

        elif node_type == "ModelTraining":
            # We expect 1 input (the DataLoader from upstream).
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

            lines.append(f"{indent}# Node: ModelTraining {node_var}")
            lines.append(f"{indent}model_type = '{model_type}'")
            lines.append(f"{indent}if model_type.lower() == 'resnet50':")
            lines.append(f"{indent}    temp_model = torchvision.models.resnet50(pretrained=False)")
            lines.append(f"{indent}    # Adjust final layer if needed, e.g. temp_model.fc = nn.Linear(...)")
            lines.append(f"{indent}else:")
            lines.append(f"{indent}    raise ValueError(f'Unsupported model: {model_type}')")
            lines.append("")
            lines.append(f"{indent}criterion = nn.CrossEntropyLoss()")
            lines.append(f"{indent}learning_rate = {learning_rate}")
            lines.append(f"{indent}epochs = {epochs}")
            lines.append("")
            lines.append(f"{indent}optimizer_type = '{optimizer_type}'")
            lines.append(f"{indent}beta1 = {beta1}")
            lines.append(f"{indent}beta2 = {beta2}")
            lines.append(f"{indent}momentum = {momentum}")
            lines.append("")
            lines.append(f"{indent}if optimizer_type == 'adam':")
            lines.append(
                f"{indent}    temp_optimizer = optim.Adam(temp_model.parameters(), lr=learning_rate, betas=(beta1, beta2))")
            lines.append(f"{indent}elif optimizer_type == 'sgd':")
            lines.append(
                f"{indent}    temp_optimizer = optim.SGD(temp_model.parameters(), lr=learning_rate, momentum=momentum)")
            lines.append(f"{indent}else:")
            lines.append(f"{indent}    raise ValueError(f'Unsupported optimizer type: {optimizer_type}')")
            lines.append("")
            lines.append(f"{indent}temp_model.to(device)")
            lines.append(f"{indent}print('Starting training for {epochs} epochs...')")
            lines.append(f"{indent}for epoch in range(epochs):")
            lines.append(f"{indent}    temp_model.train()")
            lines.append(f"{indent}    running_loss = 0.0")
            lines.append(f"{indent}    for datapoint, labels in {input_loader_var}:")
            lines.append(f"{indent}        datapoint, labels = datapoint.to(device), labels.to(device)")
            lines.append(f"{indent}        temp_optimizer.zero_grad()")
            lines.append(f"{indent}        outputs = temp_model(datapoint)")
            lines.append(f"{indent}        loss = criterion(outputs, labels)")
            lines.append(f"{indent}        loss.backward()")
            lines.append(f"{indent}        temp_optimizer.step()")
            lines.append(f"{indent}        running_loss += loss.item()")
            lines.append(f"{indent}    avg_loss = running_loss / len({input_loader_var})")
            lines.append(f"{indent}    print(f'Epoch [{{epoch+1}}/{{epochs}}], Loss: {{avg_loss:.4f}}')")
            lines.append("")
            lines.append(f"{indent}print('Training complete!')")
            lines.append(f"{indent}{node_var} = temp_model  # the final trained model")
            lines.append("")

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


examplePayload = {
    "pipelineId": "training-run-123",
    "nodes": {
        "node1": {
            "id": "node1",
            "type": "DataLoader",
            "data": {
                "datasetPath": "/path/to/dataset",
                "batchSize": 32,
                "shuffle": True
            },
            "position": {"x": 100, "y": 100}
        },
        "node2": {
            "id": "node2",
            "type": "ImageAugmentation",
            "data": {
                "rotation": 15,
                "flip": True,
                "brightness": 0.2
            },
            "position": {"x": 300, "y": 100}
        },
        "node3": {
            "id": "node3",
            "type": "ModelTraining",
            "data": {
                "modelType": "resnet50",
                "learningRate": 0.001,
                "epochs": 10,
                "optimizerConfig": {
                    "type": "adam",
                    "beta1": 0.9,
                    "beta2": 0.999
                }
            },
            "position": {"x": 500, "y": 100}
        }
    },
    "connections": {
        "conn1": {
            "sourceNodeId": "node1",
            "sourcePortId": "output",
            "targetNodeId": "node2",
            "targetPortId": "input"
        },
        "conn2": {
            "sourceNodeId": "node2",
            "sourcePortId": "output",
            "targetNodeId": "node3",
            "targetPortId": "input"
        }
    }
}

if __name__ == '__main__':
    generator = PyTorchScriptGenerator(examplePayload)
    script = generator.generate_script()
    print(script)