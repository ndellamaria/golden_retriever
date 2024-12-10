from langchain_openai import ChatOpenAI
from util.tools import tools
from langgraph.prebuilt import ToolNode

system_prompt = (
    "You are a helpful assistant who is helping a user make progress on reading content."
    + "It does not have to be a book. It can be an article, blog post, paper pdf or any other form of content."
    + "You want to help the user store their reading progress and store a record of what they have read."
    + "The user may have already started a piece of content, or they may be starting a new one."
    + "Previously started content is stored in content.json. If they have already started content, ask for their progress."
)

llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)


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
