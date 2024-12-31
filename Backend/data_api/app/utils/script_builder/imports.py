import json

class Imports(dict):
    def __init__(self):
        super().__init__()

        with open('imports_utils/generic_imports.json', 'r') as f:
            self.general_imports = json.load(f)
        with open('imports_utils/self.model_imports.json', 'r') as f:
            self.model_imports = json.load(f)

        
        for import_name, import_dict in self.general_imports.items():
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
        if import_name in self and self[import_name]["as_name"] != as_name:
                raise ValueError(f"Import {import_name} already exists with different as_name"
                                 f"consider checking models_requirements file to resolve the conflict"
                                 f""
                                 f"\33[91m TODO: Add a way to resolve this conflict automatically\33[0m")
        elif import_name in self:
            return
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
        import_dict = self.model_imports.get(model_name)
        if import_dict:
            for import_name, import_dict in import_dict.items():
                self.add_import(import_name, **import_dict)

        if args:
            for model_name in args:
                import_dict = self.model_imports.get(model_name)
                if import_dict:
                    for import_name, import_dict in import_dict.items():
                        self.add_import(import_name, **import_dict)


    def generate_package_list_for_models(self) -> list:
        """
        Generate a list of packages to install for one model
        :return: List of packages
        """
        package_list = []
        for import_name, import_dict in self.items():
            package_list.append(import_name)
        return package_list


    def generate_package_list_for_entire_project(self) -> list:
        """
        Generate a list of packages to install for the entire project
        :return: List of packages
        """
        package_list = []
        for import_name, import_dict in self.general_imports.items():
            package_list.append(import_name)
        for model_name, import_dict in self.model_imports.items():
            for import_name, import_dict in import_dict.items():
                package_list.append(import_name)
        return package_list


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