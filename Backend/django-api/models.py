from django.db import models

class PipelineNode(models.Model):
    pipeline_id = models.CharField(max_length=100)
    node_id = models.CharField(max_length=100)
    node_type = models.CharField(max_length=100)
    dataset_path = models.CharField(max_length=255)
    batch_size = models.IntegerField()
    shuffle = models.BooleanField(default=False)
