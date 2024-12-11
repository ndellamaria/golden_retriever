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