from Backend.scriptBuilder import BaseScriptGenerator

def main(scriptGenerator: BaseScriptGenerator):
    greeting = scriptGenerator.payload.get("greeting", "Hello, World!")
    numbers = scriptGenerator.payload.get("numbers", {})
    a = numbers.get("a", 0)
    b = numbers.get("b", 0)

    script_lines = [
        f'print("{greeting}")',
        f"result = {a} + {b}",
        'print("The result is:", result)',
    ]
    return "\n".join(script_lines)
