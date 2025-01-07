def function1(x):
    return x + 1


TEST = {'hi': lambda x: function1(x)}

print(TEST['hi'](2))