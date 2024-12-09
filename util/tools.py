from langchain_community.tools.tavily_search import TavilySearchResults
import json
import models.content as Content

search_tool = TavilySearchResults(max_results=2)


def save_content(content: Content):
    """Save the content object to a JSON file.
        
        Args:
            content: The content information saved in a Contact object.
    """
    with open("content.json", "w") as f:
        json.dump(content.model_dump(),f,indent=4,default=str)

tools = [search_tool, save_content]
