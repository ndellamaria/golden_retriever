from langchain_community.tools.tavily_search import TavilySearchResults
import json
from models.content import Content

search_tool = TavilySearchResults(max_results=2)


def save_content(content: Content):
    """Save the content object to a JSON file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    with open("content.json", "w") as f:
        json.dump(content.model_dump(),f,indent=4,default=str)

def handle_content_response(state: AgentState) -> AgentState:
    """Handle the response from the user about the content they are currently reading.
        
        Args:
            state: The current state of the agent.
        
        Returns:
            The updated state of the agent.
    """
    last_message = state["messages"][-1]
    if last_message.role == "user":
        if (state["current_content"] == Content.from_dict(last_message.content)): 
            
        else:
            state["current_content"] = Content.from_dict(last_message.content)
            state["next_action"] = "ask_progress"
    else: 
        return state
    
def ask_progress(state: AgentState) -> AgentState:
    """Prompt the user for their progress on the current content.
        
        Args:
            state: The current state of the agent.
        
        Returns:
            The updated state of the agent.
    """
    current_content = state["current_content"]["title"]
    response = f"I found the paper {current_content} in your history!"
    state["chat_history"].append({"role": "assistant", "content": response})
    state["next_action"] = "update_progress"
    return state

# TODO: Introduce tools when complexity required. 
# tools = [search_tool, save_content]
