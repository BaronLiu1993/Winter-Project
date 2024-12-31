def dataloader_writer(lines, node_var, dataset_path, batch_size, shuffle):
    indent = "    "
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


def image_augmentation_writer(lines, node_var, rotation, flip, brightness, crop, input_loader_var):
    indent = "    "
    lines.append(f"{indent}# Node: ImageAugmentation {node_var}")
    lines.append(f"{indent}aug_transforms = []")
    if rotation > 0:
        lines.append(f"{indent}aug_transforms.append(transforms.RandomRotation({rotation}))")
    if flip > 0:
        lines.append(f"{indent}aug_transforms.append(transforms.RandomHorizontalFlip({flip}))")
    if brightness > 0:
        lines.append(f"{indent}aug_transforms.append(transforms.ColorJitter(brightness={brightness}))")
    if crop:
        size, scale = crop[0], crop[1]
        lines.append(f"{indent}aug_transforms.append(transforms.RandomResizedCrop(size={size}), scale={scale})")
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


def trainer_writer(lines, node_var, input_loader_var, model_type, learning_rate, epochs, optimizer_type, beta1, beta2, momentum):
    indent = "    "
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
    lines.append(f"{indent}    temp_optimizer = optim.Adam(temp_model.parameters(), lr=learning_rate, betas=(beta1, beta2))")
    lines.append(f"{indent}elif optimizer_type == 'sgd':")
    lines.append(f"{indent}    temp_optimizer = optim.SGD(temp_model.parameters(), lr=learning_rate, momentum=momentum)")
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

def model_writer():
    pass