from typing import Any
import matplotlib.pyplot as plt
from Data import *

class SimpleDataSeries(Data, list[tuple[float, ...]]):
    def __init__(self):
        """
        float, some data, could be higher dimension
        """
        super().__init__()

    @staticmethod
    def castInto(root: str) -> 'SimpleDataSeries':
        """
        Helper function to cast data into this format
        """
        raise NotImplemented
        return

    def visualize(self):
        """
        use plt to visualize the data series if the dimension = 2 or 3
        """
        pass

