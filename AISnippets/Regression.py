import numpy as np
from Inference_Making import *

class Regression(Inference_Making):
    def __init__(self, mode:str = "linear"):
        super().__init__(inputType="SimpleDataSeries",outputType="list", name=None, id=None)
        self.mode: str = mode




class LinearRegression(Regression):
    pass
