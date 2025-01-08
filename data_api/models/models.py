from django.db import models

#Dataset object that will be analysed, cleaned and reconstructed from scratch by AI agents + Apache Spark Data Handling
class data_object(models.Model):
    file_name = models.CharField(max_length=255)
    file_content = models.BinaryField()  
    file_type = models.CharField(max_length=10, choices=[('csv', 'CSV'), ('json', 'JSON')]) #For now, but change later according to needs and demands of the app
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')
    cleaned_file_content = models.BinaryField(null=True, blank=True)  
    def __str__(self):
        return f"File: {self.file_name} ({self.status})"

