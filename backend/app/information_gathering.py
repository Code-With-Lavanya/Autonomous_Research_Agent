from app.state import ResearchState
from app.services.web_search import tavily_search
from app.services.retriever import get_relevant_documents


def information_gathering_node(state: ResearchState):

    plan = state["plan"]

    # -------------------------
    # Web Search
    # -------------------------

    if plan.get("need_web_search"):

        state["web_results"] = tavily_search(
            state["question"]
        )

    else:

        state["web_results"] = []

    # -------------------------
    # Retriever
    # -------------------------

    if plan.get("need_retriever") and state.get("document_path"):

        state["documents"] = get_relevant_documents(
            state["question"]
        )

    else:

        state["documents"] = []

    return state