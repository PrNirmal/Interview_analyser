import json
import re


def parse_llm_json(content: str) -> dict:

    content = content.strip()

    # Remove markdown code fences
    content = re.sub(
        r"^```(?:json)?\s*",
        "",
        content,
        flags=re.IGNORECASE,
    )

    content = re.sub(
        r"\s*```$",
        "",
        content,
    )

    content = content.strip()

    # First attempt: entire response is JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Second attempt: extract the first JSON object
    start = content.find("{")
    end = content.rfind("}")

    if start != -1 and end != -1 and end > start:
        candidate = content[start : end + 1]

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise ValueError(
        "LLM did not return valid JSON.\n\n"
        f"Raw output:\n{content}"
    )