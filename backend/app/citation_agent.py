from app.services.llm import llm_mistral as llm
from app.state import ResearchState
from app.prompt import CITATION_PROMPT
from langchain_core.prompts import ChatPromptTemplate

citation_prompt = ChatPromptTemplate.from_messages([
    ("system", CITATION_PROMPT),
    ("human",
"""
Web Results:
{web_results}

Documents:
{documents}
""")
])

citation_chain = citation_prompt | llm

def citation_node(state: ResearchState):

    web_results = "\n".join(
        r.get("url", "") for r in state["web_results"]
    )

    documents = "\n".join(
        d.metadata.get("source", "")
        for d in state["documents"]
    )

    response = citation_chain.invoke({
        "web_results": web_results,
        "documents": documents
    })

    state["citations"] = response.content

    return state