
from Backend.data_api.app.utils.script_builder.edit_script_builder import EditScriptGenerator
from topological_sort import TopologicalSorter


def process_pipeline(data):
    """Process the pipeline data and return counts"""
    try:
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])


        generator = EditScriptGenerator(nodes, connections)
        topological_sorter = TopologicalSorter(nodes, connections)
        adjacency_list, in_degrees = topological_sorter._build_graph()
        
        # Perform topological sort
        sorted_nodes = topological_sorter._topological_sort(adjacency_list, in_degrees)
        raw_script = []

        for node_id in sorted_nodes:
            node = nodes[node_id]
            node_type = node["type"]
            node_data = node["data"]
            
            generator.models_used.append(node_type)

            input_vars = topological_sorter._get_input_vars(node_id)
            
            node_var_name = f"{node_type.lower()}_{node_id}"  # e.g., dataloader_node1
            topological_sorter.node_var_map[node_id] = node_var_name

            script = generator._raw_script(node_type = node_type,
                                      node_data = node_data,
                                      node_var = node_var_name,
                                      input_vars = input_vars)
            raw_script.extend(script)
            
        import_scripts = generator._imports()

        final_script = import_scripts + raw_script
        return '\n'.join(final_script)


    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }
