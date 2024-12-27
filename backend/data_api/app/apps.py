from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField" #allow models id to be stored as 64-bit integer, could store more models
    name = "app" #internal name of the app
    verbose_name = "Pipeline API" #display name of the app
                                  # Shows in admin as: "Pipeline Processor"
    def ready(self):
        # This code runs when Django starts
        # Import and register signals, initialize services, etc.
        pass
    