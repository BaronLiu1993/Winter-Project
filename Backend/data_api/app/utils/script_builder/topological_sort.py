import collections
class TopologicalSorter:
    def __init__(self, nodes, connections):
        self.nodes = nodes
        self.connections = connections
        
        # A map of node_id -> variable_name in the final script
        self.node_var_map = {}
        self.script_lines = []

    def _build_graph(self):
        """
        Build adjacency list and in-degree map from the connections in the payload.
        Returns (adjacency_list, in_degrees).
        adjacency_list[node_id] = [list of downstream node_ids]
        in_degrees[node_id] = count of how many edges lead into node_id
        """
        adjacency_list = {nid: [] for nid in self.nodes}
        in_degrees = {nid: 0 for nid in self.nodes}
        
        for conn_id, conn_info in self.connections.items():
            src = conn_info["sourceNodeId"]
            tgt = conn_info["targetNodeId"]
            adjacency_list[src].append(tgt)
            in_degrees[tgt] += 1
        
        return adjacency_list, in_degrees
    
    def _topological_sort(self, adjacency_list, in_degrees):
        """
        Standard Kahn’s Algorithm for topological sort.
        Returns a list of node_ids in topologically sorted order.
        """
        # Collect nodes with in_degree = 0
        queue = collections.deque([n for n in in_degrees if in_degrees[n] == 0])
        sorted_order = []
        
        while queue:
            node_id = queue.popleft()
            sorted_order.append(node_id)
            for child_id in adjacency_list[node_id]:
                in_degrees[child_id] -= 1
                if in_degrees[child_id] == 0:
                    queue.append(child_id)
        
        if len(sorted_order) != len(self.nodes):
            raise ValueError("Graph has a cycle or missing nodes. Cannot do topological sort.")
        return sorted_order
    
    def _get_input_vars(self, node_id):
        """
        Find all the upstream connections feeding into node_id.
        Return a list of sourceNodeId (the outputs of upstream nodes).
        """
        input_vars = []
        for conn_info in self.connections.values():
            if conn_info["targetNodeId"] == node_id:
                source_id = conn_info["sourceNodeId"]
                # The variable name for that source node
                var_name = self.node_var_map.get(source_id, None)
                if var_name:
                    input_vars.append(var_name)
        return input_vars