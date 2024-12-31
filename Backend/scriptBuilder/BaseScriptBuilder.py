from typing import final, Optional

from Backend.scriptBuilder.imports import Imports

class BaseScriptGenerator:
    """
    Base class for all script generators.

    Use the `generate_script` method to generate the script.
    Define models used in the script in the `models_used` attribute.

    Also supports adding imports and descriptions to the script.
    """
    def __init__(self, payload: dict):
        self.payload = payload
        self.imports: Optional[Imports] = None
        self.models_used: Optional[list[str]] = None
        try:
            self.descriptions = self.payload["descriptions"]
        except KeyError:
            self.descriptions = None

    def _raw_script(self) -> str:
        """
        Subclasses must implement this method to generate the script.
        :return: The generated script
        :rtype: str
        """
        raise NotImplementedError("Subclasses must implement this method")

    def _imports(self) -> str:
        if self.models_used:
            self.imports = Imports()
            for model in self.models_used:
                self.imports.add_import(model)

        return str(self.imports) + "\n" if self.imports else ""

    def _descriptions(self) -> str:
        if self.descriptions:
            return "\n".join([f'# {description}' for description in self.descriptions]) + "\n"
        return ""


    def __add__(self, other: 'BaseScriptGenerator') -> 'BaseScriptGenerator':
        """
        Combine two script generators into a single one.

        The raw script is NOT combined, the resulting script would
        ONLY contain the raw script of first.
        """
        combined = BaseScriptGenerator({})
        combined.imports = self.imports + other.imports
        combined.models_used = self.models_used + other.models_used
        combined.descriptions = self.descriptions + other.descriptions

        return combined

    @final
    def generate_script(self) -> str:
        return self._descriptions() + self._imports() + self._raw_script()