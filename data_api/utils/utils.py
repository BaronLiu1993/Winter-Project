import pandas as pd
import json
from pyspark.sql import SparkSession
from django.core.exceptions import ValidationError, ValueError

from langchain.chains import DataCleaningChain
from langchain.graphs import LangGraph
from langchain.llms import OpenAI

from torch_geometric.data import Data as GeometricData
from torch_geometric.utils import from_networkx
import torch
import networkx as nx
'''
Start with parse -> Convert into node forms with Pytorch Geometric + Apache Spark -> LangGraph Agenic Analysis of the Graph Information to Determine Relationship 
-> Use Agents, LangChain to Clean and Fix Data Files with Directions ->  
'''

'''
#Parse data using panadas to get into good form
def load_as_graph(data, node_col, edge_col):
    """
    Deconstructs a DataFrame into a graph using PyTorch Geometric.
    
    :param data: DataFrame containing node and edge data
    :param node_col: Name of the column for node information
    :param edge_col: Name of the column for edge information
    :return: A PyTorch Geometric graph object
    """
    try:
        # Create a NetworkX graph first
        G = nx.from_pandas_edgelist(data, source=node_col[0], target=node_col[1])

        # Optionally add attributes to nodes or edges if provided
        for idx, node_data in enumerate(data[node_col[2]].values):
            if idx in G.nodes:
                G.nodes[idx]['attr'] = node_data

        # Convert to PyTorch Geometric graph
        geometric_graph = from_networkx(G)
        return geometric_graph
    except Exception as e:
        raise ValueError(f"Failed to load as graph: {e}")

def load_data_to_apache_spark(data, spark_app_name="Test"):
    try:
        spark = SparkSession.builder.appName(spark_app_name).getOrCreate()
        spark_df = spark.createDataFrame(data)
        return spark_df
    except Exception as e:
        raise ValueError(f"Failed to load data into Spark: {e}")

# Example of transforming data for PyTorch Geometric
def deconstruct_data_to_graph(data):
    try:
        # Assume columns 'source', 'target', and 'weight' for edges in the DataFrame
        graph_data = GeometricData(
            edge_index=torch.tensor(data[['source', 'target']].values.T, dtype=torch.long),
            edge_attr=torch.tensor(data['weight'].values, dtype=torch.float),
        )
        return graph_data
    except Exception as e:
        raise ValueError(f"Failed to deconstruct data into graph form: {e}")
#User prompt is the user specified use case (what is the data and what is in it)

def analyze_data_and_determine_actions(spark_df, user_prompt):
    try:
        langgraph = LangGraph()
        analysis_result = langgraph.analyze(spark_df)
        
        # Process analysis results and user prompt to determine actions
        print("Analysis Result:", analysis_result)
        print("User Prompt:", user_prompt)
        actions = []
        if "missing values" in analysis_result:
            actions.append("Fix missing values")
        if "inconsistent columns" in analysis_result:
            actions.append("Standardize column names")
        if "duplicates" in analysis_result:
            actions.append("Remove duplicate rows")
        if "sales" in user_prompt.lower():
            actions.append("Validate sales data formats")

        print("Suggested Actions:", actions)
        return actions
    except Exception as e:
        raise ValueError(f"Failed to analyze data and determine actions: {e}")

def clean_data_with_langchain(data, actions, openai_api_key, custom_model_id="gpt-4"):
    """
    Cleans data using LangChain's DataCleaningChain with a custom LLM.
    """
    try:
        llm = OpenAI(api_key=openai_api_key, model=custom_model_id)
        cleaning_chain = DataCleaningChain(llm=llm)
        cleaned_data = cleaning_chain.clean(data, actions=actions)
        return cleaned_data
    except Exception as e:
        raise ValueError(f"Failed to clean data with LangChain using custom LLM: {e}")

#Not Needed, just put here for reference, function for the full pipeline
def process_data_pipeline(file_path, file_type, user_prompt):
    """
    Complete data pipeline that parses, analyzes, determines cleaning actions, and cleans the data.
    """
    try:
        parsed_data = parse_data(file_path, file_type)
        spark_df = load_data_to_apache_spark(parsed_data)
        actions = analyze_data_and_determine_actions(spark_df, user_prompt)
        cleaned_data = clean_data_with_langchain(parsed_data, actions)
        cleaned_spark_df = load_data_to_apache_spark(cleaned_data)
        return cleaned_spark_df
    except Exception as e:
        raise ValueError(f"Data pipeline failed: {e}")
''' 