from langgraph.graph import StateGraph, END
from util.nodes import call_model, should_continue, tool_node
from util.state import AgentState
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from util.tools import tools
from langchain_openai import ChatOpenAI

system_prompt = (
    "You are a helpful assistant who is looking up aXriv papers for a user."
)

memory = MemorySaver()

llm = ChatOpenAI(model="gpt-4o")

agent = create_react_agent(llm, tools, state_modifier=system_prompt, checkpointer=memory)

# workflow = StateGraph(AgentState)

# workflow.add_node("agent", call_model)
# workflow.add_node("content_manager", tool_node)

# workflow.set_entry_point("agent")

# workflow.add_conditional_edges(
#     "agent", should_continue, {"continue": "content_manager", "end": END}
# )

# workflow.add_edge("content_manager", "agent")


# graph = workflow.compile(checkpointer=memory)

def stream_graph_updates(user_input: str):
    for event in agent.stream({"messages": [("user", user_input)]}, config={"configurable": {"thread_id": "1"}}):
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