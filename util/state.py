from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage
from typing import Annotated, TypedDict, Sequence
from models.content import Content
from typing_extensions import Optional

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_content: Optional[Content]