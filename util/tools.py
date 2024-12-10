from langchain_core.tools import tool
import json
from models.content import Content
from typing import Optional

@tool
def save_content(content: Content):
    """Save the content object to a JSON file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    with open("content.json", "w") as f:
        json.dump(content.model_dump(),f,indent=4,default=str)

@tool
def read_content() -> Optional[Content]:
    """Reads the content object from a JSON file.
        
        Returns:
            The content information if available, None if there's nothing stored.
    """
    with open("content.json", "r") as f:
        try:
            json_str = f.read()
            content = Content.model_validate_json(json_str)
            return content
        except Exception as e:
            print(f"Error reading content from file. {e}")
            return None

# TODO: Introduce tools when complexity required. 
tools = [save_content, read_content]