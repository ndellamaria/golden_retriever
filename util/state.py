from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage
from typing import Annotated, TypedDict, Sequence
from models.content import Content
from typing_extensions import Literal

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_content: Content | None
    next_action: Literal["ask_content", "validate_content", "ask_progress", "update_progress", "end"]
