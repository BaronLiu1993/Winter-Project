from rest_framework import serializers

SERIALIZER_REGISTRY = {}

def register_serializer(script_type):
    """
    A decorator to register serializers.
    """
    def wrapper(cls):
        SERIALIZER_REGISTRY[script_type] = cls
        cls.script_type = script_type  # Attach script_type metadata to the serializer
        return cls
    return wrapper


class BaseScriptPayloadSerializer(serializers.Serializer):
    script_type = serializers.ChoiceField(choices=list(SERIALIZER_REGISTRY.keys()), required=True)


@register_serializer("hello_world")
class HelloWorldPayloadSerializer(BaseScriptPayloadSerializer):
    greeting = serializers.CharField(required=False, default="Hello, World!")
    numbers = serializers.DictField(
        child=serializers.IntegerField(), required=False, default={"a": 0, "b": 0}
    )


@register_serializer("ModelBuilder")
class ModelBuilderPayloadSerializer(BaseScriptPayloadSerializer):
    # not implemented yet
    raise NotImplementedError("ModelBuilderPayloadSerializer is not implemented yet.")




