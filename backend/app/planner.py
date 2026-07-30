from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from app.state import ResearchState
from app.services.llm import llm_mistral as llm
from app.prompt import PLANNER_PROMPT

class PlannerOutput(BaseModel):
    need_web_search: bool
    need_retriever: bool
    research_plan: list[str]
    
planner_prompt = ChatPromptTemplate.from_messages([
    ("system", PLANNER_PROMPT),
    ("human", "{question}")
])

planner_chain = planner_prompt | llm


def planner_node(state: ResearchState):

    response = planner_chain.invoke({
        "question": state["question"]
    })

    planner_output = PlannerOutput.model_validate_json(
        response.content
    )

    state["plan"] = planner_output.model_dump()

    return state