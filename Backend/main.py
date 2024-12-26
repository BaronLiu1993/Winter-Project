EXAMPLE = {
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
    pass