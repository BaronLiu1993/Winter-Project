try:
    from Backend.models_requirements import MODEL_IMPORTS, GENERIC_IMPORTS
except ImportError as e:
    print("Missing Imports Requirements")
    raise e

class Imports(dict):
    def __init__(self):
        super().__init__()

        if GENERIC_IMPORTS:
            for import_name, import_dict in GENERIC_IMPORTS.items():
                self.add_import(import_name, **import_dict)

    def add_import(self, import_name: str, as_name: str = None, specifier: str = None) -> None:
        """
        Add an import to the imports list.

        EXAMPLES:
        add_import("numpy", as_name="np"):
            import numpy as np

        add_import("numpy", specifier="array"):
            from numpy import array

        add_import("numpy", as_name="np", specifier="array"):
            from numpy import array as np

        :param import_name: The name of the module to import
        :type import_name: str
        :param as_name: The name to use when importing the module
        :type as_name: str
        :param specifier: The specific thing to import from the module
        :type specifier: str
        """
        import_name = import_name.replace("/", ".")
        self[import_name] = {"as_name": as_name, "specifier": specifier}

    def add_import_for_model(self, model_name: str, *args) -> None:
        """
        Add the imports required for a specific model or multiple models.

        EXAMPLES:
        add_import_for_model("k_means"):
            from sklearn.cluster import cluster

        add_import_for_model("k_means", "linear_regression"):
            from sklearn.cluster import cluster
            from sklearn.linear_model import linear_model

        :param model_name: The name of the model s
        :type model_name: str
        """
        import_dict = MODEL_IMPORTS.get(model_name)
        if import_dict:
            for import_name, import_dict in import_dict.items():
                self.add_import(import_name, **import_dict)

        if args:
            for model_name in args:
                import_dict = MODEL_IMPORTS.get(model_name)
                if import_dict:
                    for import_name, import_dict in import_dict.items():
                        self.add_import(import_name, **import_dict)

    def __add__(self, other: 'Imports') -> 'Imports':
        combined = Imports()
        for import_name, import_dict in self.items():
            combined.add_import(import_name, **import_dict)
        for import_name, import_dict in other.items():
            combined.add_import(import_name, **import_dict)
        return combined

    def __str__(self) -> str:
        ret = ""
        for import_name, import_dict in self.items():
            as_name = import_dict["as_name"]
            specifier = import_dict["specifier"]

            if as_name and specifier:
                ret += f"from {import_name} import {specifier} as {as_name}\n"
            elif as_name:
                ret += f"import {import_name} as {as_name}\n"
            elif specifier:
                ret += f"from {import_name} import {specifier}\n"
            else:
                ret += f"import {import_name}\n"
        return ret