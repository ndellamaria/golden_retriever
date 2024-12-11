from langchain_core.tools import tool
import json
from models.content import Content
from langchain_community.agent_toolkits.load_tools import load_tools
from typing import List

# Create a regular function for loading content (not a tool)
def load_content_from_file() -> List[Content]:
    """Load the content object from a JSON file."""
    try:
        with open("content.json", "r") as f:
            contents = json.load(f)
            content_objects = [Content(**content_data) for content_data in contents]
            return content_objects
    except Exception as e:
        print(f"Error reading content from file. {e}")
        return []

@tool
def load_content() -> List[Content]:
    """Tool to load the content object from a JSON file."""
    return load_content_from_file()

def save_content(content: List[Content]) -> str:
    """Save the content object to a JSON file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    with open("content.json", "w") as f:
        content_dicts = [c.model_dump() for c in content]
        json.dump(content_dicts,f,indent=4,default=str)

@tool(return_direct=False)
def add_content(content: Content) -> str:
    """Add a new content object to the content.json file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    try:
        with open("content.json", "r") as f:
            contents = load_content_from_file()
            contents.append(content)
            save_content(contents)
    except Exception as e:
        print(f"Error adding content to file. {e}")

@tool(return_direct=False)
def update_content(content: Content) -> str:
    """Update the content object in the content.json file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    try:
        with open("content.json", "r") as f:
            contents = load_content_from_file()
            for i, c in enumerate(contents):
                if c.title == content.title:
                    contents[i] = content
                    save_content(contents)
                    break
    except Exception as e:
        print(f"Error updating content in file. {e}")

arxiv = load_tools(["arxiv"])

tools = [load_content, add_content, update_content] + arxiv