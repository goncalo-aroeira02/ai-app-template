"""Unit tests for the Gherkin parser and serializer."""

from pathlib import Path

from app.gherkin.parser import ParsedFeature, ParsedScenario, ParsedStep, extract_tags, parse_feature
from app.gherkin.serializer import serialize_feature

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str) -> str:
    return (FIXTURES / name).read_text()


# ── extract_tags ─────────────────────────────────────────────────────

def test_extract_tags_status():
    assert extract_tags(["@status-active"]) == {"status": "active"}


def test_extract_tags_multiple():
    tags = extract_tags(["@status-draft", "@priority-high", "@points-5"])
    assert tags == {"status": "draft", "priority": "high", "points": "5"}


def test_extract_tags_ignores_unknown():
    tags = extract_tags(["@wip", "@status-done", "@unknown-tag"])
    assert tags == {"status": "done"}


# ── parse_feature ────────────────────────────────────────────────────

def test_parse_login_feature():
    content = _load("sample_login.feature")
    feat = parse_feature(content)

    assert feat.title == "Login Flow"
    assert feat.tags == {"status": "active"}
    assert "log in securely" in feat.description
    assert len(feat.scenarios) == 2


def test_parse_login_scenarios():
    content = _load("sample_login.feature")
    feat = parse_feature(content)

    s1 = feat.scenarios[0]
    assert s1.title == "Successful login with valid credentials"
    assert s1.tags == {"status": "in_progress"}
    assert len(s1.steps) == 3
    assert s1.steps[0].keyword == "Given"
    assert s1.steps[0].text == "I am on the login page"

    s2 = feat.scenarios[1]
    assert s2.title == "Failed login with invalid password"
    assert s2.tags == {"status": "draft"}
    assert len(s2.steps) == 4
    assert s2.steps[3].keyword == "And"


def test_parse_empty_feature():
    content = _load("sample_empty.feature")
    feat = parse_feature(content)

    assert feat.title == "Empty Feature"
    assert feat.tags == {"status": "draft"}
    assert feat.scenarios == []
    assert "no scenarios" in feat.description


def test_parse_empty_string():
    feat = parse_feature("")
    assert feat.title == ""
    assert feat.scenarios == []


# ── serialize_feature ────────────────────────────────────────────────

def test_serialize_produces_valid_gherkin():
    feature = ParsedFeature(
        tags={"status": "active"},
        title="Test Feature",
        description="A test description.",
        raw_tags=["@status-active"],
        scenarios=[
            ParsedScenario(
                tags={"status": "draft"},
                title="A scenario",
                raw_tags=["@status-draft"],
                steps=[
                    ParsedStep(keyword="Given", text="something"),
                    ParsedStep(keyword="When", text="action"),
                    ParsedStep(keyword="Then", text="result"),
                ],
            )
        ],
    )
    output = serialize_feature(feature)

    assert "Feature: Test Feature" in output
    assert "@status-active" in output
    assert "  Scenario: A scenario" in output
    assert "    Given something" in output
    assert output.endswith("\n")


# ── Round-trip ───────────────────────────────────────────────────────

def test_round_trip_login():
    content = _load("sample_login.feature")
    parsed = parse_feature(content)
    serialized = serialize_feature(parsed)
    reparsed = parse_feature(serialized)

    assert reparsed.title == parsed.title
    assert reparsed.tags == parsed.tags
    assert len(reparsed.scenarios) == len(parsed.scenarios)
    for orig, rt in zip(parsed.scenarios, reparsed.scenarios):
        assert rt.title == orig.title
        assert rt.tags == orig.tags
        assert len(rt.steps) == len(orig.steps)
        for os, rs in zip(orig.steps, rt.steps):
            assert rs.keyword == os.keyword
            assert rs.text == os.text
