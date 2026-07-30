from fastapi import APIRouter

from app.schemas.request import ResearchRequest
from app.schemas.response import ResearchResponse

from app.graph.workflow import run_workflow

router = APIRouter(tags=["Research"])


@router.post(
    "/research",
    response_model=ResearchResponse
)
def generate_report(request: ResearchRequest):

    result = run_workflow(
        question=request.question,
        document_path=request.document_path
        )

    review = result["review"]

    return ResearchResponse(
    approved=review["approved"],
    score=review["score"],
    feedback=review["feedback"],
    report=result["report"]
    )