from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from app.services.llm import llm_mistral as llm
from app.prompt import CRITIC_PROMPT
from app.state import ResearchState

class CriticOutput(BaseModel):

    approved: bool

    feedback: str

    score: int

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", CRITIC_PROMPT),
    ("human",
"""
Question:
{question}

Report:
{report}
""")
])

critic_chain = critic_prompt | llm

def critic_node(state: ResearchState):

    response = critic_chain.invoke({

        "question": state["question"],

        "report": state["report"]

    })

    review = CriticOutput.model_validate_json(
        response.content
    )

    state["review"] = review.model_dump()

    return state