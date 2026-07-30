from app.planner import planner_node
from app.information_gathering import information_gathering_node
from app.resaerch import research_node
from app.citation_agent import citation_node
from app.writer_agent import writer_node
from app.critic_agent import critic_node
from app.state import ResearchState

from langgraph.graph import StateGraph, START, END

def route_after_critic(state):
    if state["review"]["approved"]:
        return END

    if state["retry_count"] >= 3:
        return END

    return "research_step"

workflow = StateGraph(ResearchState)

workflow.add_node("planner", planner_node)
workflow.add_node("information", information_gathering_node)
workflow.add_node("research_step", research_node)
workflow.add_node("citation", citation_node)
workflow.add_node("writer", writer_node)
workflow.add_node("critic", critic_node)

workflow.add_edge(START, "planner")
workflow.add_edge("planner", "information")
workflow.add_edge("information", "research_step")
workflow.add_edge("research_step", "citation")
workflow.add_edge("citation", "writer")
workflow.add_edge("writer", "critic")

workflow.add_conditional_edges(
    "critic",
    route_after_critic,
    {
        "research_step": "research_step",
        END: END
    }
)

graph = workflow.compile()

def run_workflow(question: str, document_path: str | None):

    state = {
        "question": question,
        "document_path": document_path,
        "retry_count": 0
    }
    return graph.invoke(state)