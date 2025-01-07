

def data_augmentation_script(node_data, node_var, input_vars):
    indent = "    "
    lines = []
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
    return lines


