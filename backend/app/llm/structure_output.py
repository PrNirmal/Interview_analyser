from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate

from app.domain.answer import InterviewAnswer
from app.llm.llm_factory import get_llm
from app.llm.json_utils import parse_llm_json
from app.llm.prompts import INTERVIEW_ANSWER_PROMPT


def format_evidence(documents: list[Document]) -> str:
    """
    Convert retrieved transcript documents into a structured
    evidence block for the LLM.
    """

    evidence = []

    for document in documents:
        metadata = document.metadata

        evidence.append(
            f"""
SEGMENT_ID: {metadata["segment_id"]}
TIMESTAMP: {metadata["timestamp"]}
SPEAKER: {metadata.get("speaker", "")}
EXPERT: {metadata.get("expert", "")}
ROLE: {metadata.get("role", "")}
MARKET: {metadata.get("market", "")}

TEXT:
{document.page_content}
"""
        )

    return "\n".join(evidence)


def generate_answer(
    question: str,
    documents: list[Document],
) -> InterviewAnswer:
    """
    Generate an interview answer using only the retrieved evidence.

    Flow:

        Question
            ↓
        Retrieved documents
            ↓
        Prompt
            ↓
        LLM
            ↓
        Raw response
            ↓
        JSON parser
            ↓
        Pydantic validation
            ↓
        InterviewAnswer
    """

    # ---------------------------------------------------------
    # 1. Get configured LLM
    # ---------------------------------------------------------

    llm = get_llm()

    # ---------------------------------------------------------
    # 2. Build prompt
    # ---------------------------------------------------------

    prompt = ChatPromptTemplate.from_template(
        INTERVIEW_ANSWER_PROMPT
    )

    # ---------------------------------------------------------
    # 3. Create LangChain chain
    # ---------------------------------------------------------

    chain = prompt | llm

    # ---------------------------------------------------------
    # 4. Format retrieved evidence
    # ---------------------------------------------------------

    evidence = format_evidence(documents)

    # ---------------------------------------------------------
    # 5. Invoke LLM
    # ---------------------------------------------------------

    response = chain.invoke(
        {
            "question": question,
            "evidence": evidence,
        }
    )

    # ---------------------------------------------------------
    # 6. Normalize LLM response
    #
    # OpenRouter ChatOpenAI:
    #     response.content
    #
    # HuggingFace custom LLM:
    #     response -> str
    # ---------------------------------------------------------

    if isinstance(response, str):
        content = response

    elif hasattr(response, "content"):
        content = response.content

    else:
        raise TypeError(
            f"Unsupported LLM response type: {type(response)}"
        )

    # ---------------------------------------------------------
    # 7. Handle structured content blocks
    # ---------------------------------------------------------

    if isinstance(content, list):
        content = "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict)
        )

    content = content.strip()

    # ---------------------------------------------------------
    # 8. Temporary debugging
    #
    # Keep this while testing the local Qwen model.
    # We can remove it later.
    # ---------------------------------------------------------

    print("\n===== RAW LLM OUTPUT =====")
    print(content)
    print("===========================\n")

    # ---------------------------------------------------------
    # 9. Parse JSON
    # ---------------------------------------------------------

    data = parse_llm_json(content)

    # ---------------------------------------------------------
    # 10. Validate against Pydantic schema
    # ---------------------------------------------------------

    return InterviewAnswer.model_validate(data)