from langchain_openai import ChatOpenAI
from util.tools import tools
from langgraph.prebuilt import ToolNode

system_prompt = "You are a helpful assistant"

llm = ChatOpenAI(model = "gpt-4o").bind_tools(tools)

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
