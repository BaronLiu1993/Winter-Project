from typing import Optionald


class Inference_Making(object):
    def __init__(self,
                 inputType,
                 outputType,
                 name,
                 id):
        self._name: str = name
        self.id: Optional[int] = id
        self.inputType: Optional[str] = inputType
        self.outputType: Optional[str] = outputType

    def __call__(self, *args, **kwargs):
        """
        Function to perform inference on the model
        :param args:
        :param kwargs:
        :return:
        :raises: NotImplementedError if the method is not implemented
        """
        raise NotImplementedError("Inference class must implement __call__ method")

