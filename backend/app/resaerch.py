from langchain_core.prompts import ChatPromptTemplate
from app.services.llm import llm_mistral as llm
from app.prompt import RESEARCH_PROMPT
from app.state import ResearchState

research_prompt = ChatPromptTemplate.from_messages(
[
    ("system", RESEARCH_PROMPT),
    ("human",
"""
Question:
{question}

Web Search:
{web_results}

Retrieved Documents:
{documents}
""")
])

research_chain = research_prompt | llm

def research_node(state: ResearchState):

    web_text = "\n\n".join(
        result.get("content", "")
        for result in state["web_results"]
    )

    doc_text = "\n\n".join(
        doc.page_content
        for doc in state["documents"]
    )

    response = research_chain.invoke({
        "question": state["question"],
        "web_results": web_text,
        "documents": doc_text
    })

    state["research"] = response.content

    return state