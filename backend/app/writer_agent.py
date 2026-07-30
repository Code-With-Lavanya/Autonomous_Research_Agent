from app.services.llm import llm_mistral as llm
from app.prompt import WRITER_PROMPT
from app.state import ResearchState
from langchain_core.prompts import ChatPromptTemplate

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", WRITER_PROMPT),
    ("human",
"""
Question:
{question}

Research Summary:
{research}
""")
])

writer_chain = writer_prompt | llm

def writer_node(state: ResearchState):

    response = writer_chain.invoke({
        "question": state["question"],
        "research": state["research"]
    })

    state["report"] = response.content

    return state
