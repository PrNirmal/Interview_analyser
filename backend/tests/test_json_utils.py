import json

import pytest

from app.llm.json_utils import parse_llm_json

BROKEN_EVIDENCE = """
{
  "answer": "Cost and a slow procurement process are the main barriers.",
  "evidence": [
    {
      "segment_id": "Transcript_2_Germany-4",
      "timestamp": "01:10",
      "quote": "Cost is the first barrier."
    },
    {
      "segment_id": "Transcript_2_Germany-6",
      "timestamp": "02:08",
      "quote": "The economic case decides whether it gets approved."
    },
      "timestamp": "06:05",
      "quote": "Nine to eighteen months is common."
    },
    {
      "segment_id": "Transcript_2_Germany-10",
      "timestamp": "04:09",
      "quote": "Growth will be gradual."
    }
  ],
  "confidence": "high"
}
"""


def test_parse_llm_json_keeps_valid_response():
    payload = {
        "answer": "Adoption is growing.",
        "evidence": [
            {
                "segment_id": "Transcript_1_France-2",
                "timestamp": "00:40",
                "quote": "Adoption is growing in larger hospitals.",
            }
        ],
        "confidence": "high",
    }

    assert parse_llm_json(json.dumps(payload)) == payload


def test_parse_llm_json_drops_broken_evidence_item():
    data = parse_llm_json(BROKEN_EVIDENCE)

    assert data["answer"].startswith("Cost and a slow procurement")
    assert data["confidence"] == "high"
    assert [item["segment_id"] for item in data["evidence"]] == [
        "Transcript_2_Germany-4",
        "Transcript_2_Germany-6",
        "Transcript_2_Germany-10",
    ]


def test_parse_llm_json_still_rejects_unreadable_output():
    with pytest.raises(ValueError, match="valid JSON"):
        parse_llm_json("the model replied in prose")
