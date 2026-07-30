from tavily import TavilyClient
from dotenv import load_dotenv
import os
load_dotenv()

search_model = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def tavily_search(query: str):

    try:
        response = search_model.search(
            query=query,
            search_depth="advanced",
            max_results=5
        )

        return response["results"]

    except Exception as e:

        print(e)

        return []