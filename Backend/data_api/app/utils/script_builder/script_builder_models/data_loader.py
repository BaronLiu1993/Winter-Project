def data_loader_script(node_data, node_var, input_vars):
    indent = "    "
    lines = []
    
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
    return lines