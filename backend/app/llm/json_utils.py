import json
import logging
import re

logger = logging.getLogger(__name__)

_EVIDENCE_FIELDS = ("segment_id", "timestamp", "quote")


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

    parsed = _loads_object(content)
    if parsed is not None:
        return parsed

    # Second attempt: extract the first JSON object
    start = content.find("{")
    end = content.rfind("}")
    candidate = content[start : end + 1] if start != -1 and end > start else None

    if candidate is not None:
        parsed = _loads_object(candidate)
        if parsed is not None:
            return parsed

    repaired = _repair_evidence_array(candidate or content)
    if repaired is not None:
        return repaired

    raise ValueError(
        "LLM did not return valid JSON.\n\n"
        f"Raw output:\n{content}"
    )


def _loads_object(content: str) -> dict | None:
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return None
    if isinstance(data, dict):
        return data
    return None


def _repair_evidence_array(content: str) -> dict | None:
    """Keep complete evidence objects and drop a fragment the model left unclosed."""

    key = content.find('"evidence"')
    if key == -1:
        return None

    bracket = content.find("[", key)
    if bracket == -1:
        return None

    scanned = _scan_evidence_array(content, bracket)
    if scanned is None:
        return None

    items, dropped, end = scanned
    if dropped == 0:
        return None

    repaired = content[:bracket] + json.dumps(items) + content[end:]
    data = _loads_object(repaired)
    if data is None:
        return None

    logger.warning(
        "Dropped %s unreadable evidence item(s) from the model response.",
        dropped,
    )
    return data


def _scan_evidence_array(text: str, start: int) -> tuple[list[dict], int, int] | None:
    """start points at '['. Returns kept items, dropped count, and the index after ']'."""

    decoder = json.JSONDecoder()
    items: list[dict] = []
    dropped = 0
    index = start + 1

    while index < len(text):
        index = _skip_separators(text, index)
        if index >= len(text):
            return None
        if text[index] == "]":
            return items, dropped, index + 1
        if text[index] == "{":
            try:
                value, end = decoder.raw_decode(text, index)
            except json.JSONDecodeError:
                dropped += 1
                index = _skip_to_object_or_end(text, index + 1)
                continue
            if _is_evidence(value):
                items.append(value)
            else:
                dropped += 1
            index = end
            continue

        dropped += 1
        index = _skip_to_object_or_end(text, index)

    return None


def _is_evidence(value: object) -> bool:
    if not isinstance(value, dict):
        return False
    return all(
        isinstance(value.get(field), str) and value[field].strip() != ""
        for field in _EVIDENCE_FIELDS
    )


def _skip_separators(text: str, index: int) -> int:
    while index < len(text) and text[index] in " \t\r\n,":
        index += 1
    return index


def _skip_to_object_or_end(text: str, index: int) -> int:
    in_string = False
    escape = False

    while index < len(text):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            index += 1
            continue
        if char == '"':
            in_string = True
            index += 1
            continue
        if char in "{]":
            return index
        index += 1

    return index
