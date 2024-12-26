from typing import final

# generic imports required for all script generators
GENERIC_IMPORTS: final = {"numpy": {"as_name": "np"},
                   "typing": None}


# imports required for specific models
MODEL_IMPORTS: final = {
    "hello_world": None,
    "k_means": {"sklearn.cluster": {"as_name": "cluster"}},
    "linear_regression": {"sklearn.linear_model": {"as_name": "linear_model"}}
}


