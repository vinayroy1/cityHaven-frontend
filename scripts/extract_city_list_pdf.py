#!/usr/bin/env python3
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

from pypdf import PdfReader


STATE_NAMES = [
    "Andaman & Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra & Nagar Haveli",
    "Daman & Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]


STATE_LOOKUP = {re.sub(r"\s+", " ", state).lower(): state for state in STATE_NAMES}
IGNORED_SECTION_HEADINGS = {
    "chandigarh metro",
    "travel destinations",
    "cities with house addresses*",
    "cities with house addresses",
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_city(value: str) -> str:
    value = normalize_space(value)
    value = re.sub(r"^4\s*", "", value)
    value = re.sub(r"\s+([,&])", r"\1", value)
    return value.strip()


def detect_state(buffer: list[str]) -> str | None:
    text = normalize_space(" ".join(buffer))
    return STATE_LOOKUP.get(text.lower())


def extract_page_rows(page) -> list[tuple[float, float, str]]:
    parts = []

    def visitor(text, cm, tm, font, size):
        text = text.strip()
        if text:
            parts.append((float(tm[4]), float(tm[5]), text))

    page.extract_text(visitor_text=visitor)
    return parts


def group_columns(parts: list[tuple[float, float, str]]) -> list[list[tuple[float, str]]]:
    marker_xs = sorted({round(x, 1) for x, _y, text in parts if text == "4"})
    if not marker_xs:
        return []

    starts = marker_xs
    columns = [[] for _ in starts]

    for x, y, text in parts:
        idx = 0
        for i, start in enumerate(starts):
            if x >= start - 2:
                idx = i
        columns[idx].append((y, text))

    for column in columns:
        column.sort(key=lambda item: -item[0])
    return columns


def parse_pdf(pdf_path: Path) -> dict[str, list[str]]:
    reader = PdfReader(str(pdf_path))
    cities_by_state: dict[str, list[str]] = defaultdict(list)
    current_state = None
    pending_state_words: list[str] = []
    pending_city = None
    seen_by_state: dict[str, set[str]] = defaultdict(set)

    def flush_city():
        nonlocal pending_city
        if not current_state or not pending_city:
            pending_city = None
            return
        city = normalize_city(" ".join(pending_city))
        if city and city.lower() not in seen_by_state[current_state]:
            cities_by_state[current_state].append(city)
            seen_by_state[current_state].add(city.lower())
        pending_city = None

    for page in reader.pages[1:]:
        for column in group_columns(extract_page_rows(page)):
            for _y, text in column:
                text = normalize_space(text)
                if not text:
                    continue

                direct_state = STATE_LOOKUP.get(text.lower())
                if direct_state:
                    flush_city()
                    current_state = direct_state
                    pending_state_words = []
                    continue

                if text.lower() in IGNORED_SECTION_HEADINGS:
                    flush_city()
                    current_state = None
                    pending_state_words = []
                    continue

                if text == "4":
                    flush_city()
                    pending_state_words = []
                    pending_city = []
                    continue

                if pending_city is not None:
                    pending_city.append(text)
                    continue

                pending_state_words.append(text)
                state = detect_state(pending_state_words)
                if state:
                    flush_city()
                    current_state = state
                    pending_state_words = []

            flush_city()

    result = {
        state: cities_by_state.get(state, [])
        for state in STATE_NAMES
        if cities_by_state.get(state)
    }
    return result


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: extract_city_list_pdf.py <input.pdf> <output.json>", file=sys.stderr)
        return 2

    pdf_path = Path(sys.argv[1]).expanduser()
    output_path = Path(sys.argv[2]).expanduser()
    data = parse_pdf(pdf_path)
    payload = {
        "source": str(pdf_path),
        "states": [
            {"state": state, "cities": cities}
            for state, cities in data.items()
        ],
        "totalStates": len(data),
        "totalCities": sum(len(cities) for cities in data.values()),
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"output": str(output_path), "totalStates": payload["totalStates"], "totalCities": payload["totalCities"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
