from langgraph.graph import StateGraph, END
from util.nodes import call_model, should_continue, tool_node
from util.state import AgentState
from langgraph.checkpoint.memory import MemorySaver



def ask_what_reading(state: AgentState) -> AgentState:
    """Initial prompt to ask the user what they are currently reading."""
    response = "What are you currently reading?"
    state["chat_history"].append({"role": "assistant", "content": response})
    state["next_action"] = "validate_content"
    return state

workflow = StateGraph(AgentState)



workflow.add_node("agent", call_model)
workflow.add_node("search", tool_node)

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent", should_continue, {"continue": "search", "end": END}
)

workflow.add_edge("search", "agent")

memory = MemorySaver()

graph = workflow.compile(checkpointer=memory)

def stream_graph_updates(user_input: str):
    for event in graph.stream({"messages": [("user", user_input)]}, config={"configurable": {"thread_id": "1"}}):
        for value in event.values():
            print("Assistant:", value["messages"][-1].content)

while True:
    try:
        user_input = input("User: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break

        stream_graph_updates(user_input)
    except:
        # fallback if input() is not available
        user_input = "What do you know about LangGraph?"
        print("User: " + user_input)
        stream_graph_updates(user_input)
        break