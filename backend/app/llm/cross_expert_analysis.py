from langchain_core.prompts import ChatPromptTemplate

from app.domain.analysis import CrossExpertAnalysis
from app.llm.llm_factory import get_llm
from app.llm.json_utils import parse_llm_json
from app.llm.prompts import CROSS_EXPERT_ANALYSIS_PROMPT


def format_expert_answers(analyses) -> str:
    sections = []

    for analysis in analyses:
        sections.append(
            f"""
==================================================
EXPERT
==================================================

Name: {analysis.expert}
Role: {analysis.role}
Market: {analysis.market}
Transcript ID: {analysis.transcript_id}
"""
        )

        for answer in analysis.answers:
            sections.append(
                f"""
QUESTION ID: {answer.question_id}

QUESTION:
{answer.question}

ANSWER:
{answer.answer}

CONFIDENCE:
{answer.confidence}

EVIDENCE SEGMENT IDS:
"""
            )

            if not answer.evidence:
                sections.append("No supporting evidence was found.\n")
                continue

            for evidence in answer.evidence:
                sections.append(
                    f"{evidence.segment_id}\n"
                )

    return "\n".join(sections)


def generate_cross_expert_analysis(analyses) -> CrossExpertAnalysis:
    llm = get_llm()

    prompt = ChatPromptTemplate.from_template(
        CROSS_EXPERT_ANALYSIS_PROMPT
    )

    chain = prompt | llm

    expert_answers = format_expert_answers(analyses)

    response = chain.invoke(
        {
            "expert_answers": expert_answers,
        }
    )

    if isinstance(response, str):
        content = response

    elif hasattr(response, "content"):
        content = response.content

    else:
        raise TypeError(
            f"Unsupported LLM response type: {type(response)}"
        )

    if isinstance(content, list):
        content = "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict)
        )

    content = content.strip()

    print("\n===== RAW CROSS-EXPERT OUTPUT =====")
    print(content)
    print("===================================\n")

    data = parse_llm_json(content)

    return CrossExpertAnalysis.model_validate(data)