from langchain_openai import ChatOpenAI
from util.tools import tools
from langgraph.prebuilt import ToolNode

system_prompt = (
    "You are a helpful assistant who is helping a user store their reading progress of any content."
    + "It does not have to be a book. It can be an article, blog post, or any other form of content."
    + "Please prompt the user for what they are currently reading. Then research for the author and summary."
    + "Finally, ask the user for their progress and store the information."
)

llm = ChatOpenAI(model="gpt-4o")


def should_continue(state):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "end"
    return "continue"


def call_model(state):
    messages = state["messages"]
    messages = [{"role": "system", "content": system_prompt}] + messages
    response = llm.invoke(messages)
    return {"messages": [response]}


tool_node = ToolNode(tools)
