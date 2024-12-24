import pandas as pd
import json
from pyspark.sql import SparkSession
from django.core.exceptions import ValidationError, ValueError

from langchain.chains import DataCleaningChain
from langchain.graphs import LangGraph
from langchain.llms import OpenAI

#Parse data using panadas
def parse_data(file_path, file_type):
    try:
        if file_type == 'csv':
            return pd.open_cv(file_path)
        elif file_type == 'json':
            with open(file_path, 'r') as f:
                return pd.Dataframe(json.load(f))
        elif file_type == 'xlsx':
            return pd.read_excel(file_path)
        else:
            raise ValidationError(f"Unsupported file type of {file_type}")
    except Exception as e:
        raise ValueError(f"Failed to parse data: {e}")
#Data is pandas dataframe that is loaded from the CSV
def load_data_to_apache_spark(data, spark_app_name = "Test"):
    try:
        spark = SparkSession.builder.appName(spark_app_name).getOrCreate()
        spark_df = spark.createDataFrame(data)
        return spark_df
    except Exception as e:
        raise ValueError(f"Failed to load data into Spark: {e}")
    
#User prompt is the user specified use case (what is the data and what is in it)

def analyze_data_and_determine_actions(spark_df, user_prompt):
    try:
        langgraph = LangGraph()
        analysis_result = langgraph.analyze(spark_df)
        
        # Process analysis results and user prompt to determine actions
        print("Analysis Result:", analysis_result)
        print("User Prompt:", user_prompt)
        '''Add more actions for future prototypes, for now leave it to 
        this as these are relatively simple, but more complex transformations will 
        require more options to cover edge cases
        '''
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
        # Set up the LLM
        llm = OpenAI(api_key=openai_api_key, model=custom_model_id)

        # Configure the cleaning chain to use the custom LLM
        cleaning_chain = DataCleaningChain(llm=llm)
        
        # Clean the data
        cleaned_data = cleaning_chain.clean(data, actions=actions)
        return cleaned_data
    except Exception as e:
        raise ValueError(f"Failed to clean data with LangChain using custom LLM: {e}")

#Not Needed, just put here for reference
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
        