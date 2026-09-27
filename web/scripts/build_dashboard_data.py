"""Convert Allen's wellbeing pipeline outputs into dashboard JSON.

Run from the `web` directory after generating outputs with
`../Allen/student_wellbeing_ai.py`.
"""

from __future__ import annotations

import ast
import csv
import json
from pathlib import Path
from typing import Any

WEB_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = WEB_ROOT.parent / "Allen" / "wellbeing_outputs"
TARGET = WEB_ROOT / "public" / "data" / "dashboard.json"

FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Diya", "Ishaan", "Kabir", "Meera", "Neha", "Rohan",
    "Sana", "Vihaan", "Zara", "Dev", "Kavya", "Rehan", "Tara", "Mihir", "Nisha", "Yash",
]
LAST_NAMES = [
    "Sharma", "Patel", "Rao", "Mehta", "Iyer", "Kapoor", "Nair", "Khan", "Desai", "Joshi",
    "Malhotra", "Sen", "Bose", "Reddy", "Chatterjee", "Menon", "Kulkarni", "Saxena", "Bhat", "Verma",
]
SIGNAL_COLUMNS = [
    ("class_participation", "Class participation"),
    ("arrival_irregularity", "Arrival irregularity"),
    ("early_departures", "Early departures"),
    ("extracurricular_activity", "Extracurricular activity"),
    ("library_resource_usage", "Library/resource usage"),
    ("lms_session_duration", "LMS session duration"),
    ("academic_help_requests", "Academic-help requests"),
    ("meal_usage", "Meal usage"),
    ("transport_irregularity", "Transport irregularity"),
    ("schedule_changes", "Schedule changes"),
    ("digital_timing_shift", "Digital timing shift"),
]


def rows(filename: str) -> list[dict[str, str]]:
    with (OUTPUT_DIR / filename).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def fictional_student_name(student_id: str) -> str:
    result = 2166136261
    for character in student_id:
        result ^= ord(character)
        result = (result * 16777619) & 0xFFFFFFFF
    return f"{FIRST_NAMES[result % len(FIRST_NAMES)]} {LAST_NAMES[(result >> 8) % len(LAST_NAMES)]}"


def number(value: Any, digits: int = 1) -> float:
    return round(float(value), digits)


def parse_onset_order(value: str) -> list[dict[str, Any]]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        parsed = ast.literal_eval(value)
    return [
        {"signal": str(item["signal"]), "label": str(item["label"]), "week": int(item["week"])}
        for item in parsed
    ]


def build() -> dict[str, Any]:
    cards = rows("student_risk_cards.csv")
    raw_rows = rows("synthetic_student_behavior_9_weeks.csv")
    replay_rows = rows("early_warning_replay.csv")
    trajectory_rows = rows("student_trajectory_engine.csv")
    cascade_rows = rows("behavioral_cascade_analysis.csv")
    event_rows = rows("trajectory_events.csv")
    transition_rows = rows("signal_transition_matrix.csv")
    heatmap_rows = rows("signal_heatmap_data.csv")

    raw_measurements = {
        (row["student_id"], int(row["week"])): {
            "measurements": {column: number(row[column], 2) for column, _ in SIGNAL_COLUMNS}
        }
        for row in raw_rows
    }
    timelines: dict[str, list[dict[str, Any]]] = {}
    for row in replay_rows:
        student_id = row["student_id"]
        timelines.setdefault(student_id, []).append(
            {
                "week": int(row["week"]),
                "risk": number(row["weekly_risk"]),
                "rolling": number(row["rolling_risk_3w"]),
                "severity": row["severity"],
                "velocity": number(row["risk_velocity"], 2),
                "trajectory": row["trajectory_state"],
                "phase": row["trajectory_phase"],
                "signals": int(row["meaningful_signal_count"]),
                "isFirstDeviation": int(row["week"]) == int(row["first_deviation_week"]),
                "cascadeActive": row["cascade_active"].lower() == "true",
                "timelineEvent": row["timeline_event"],
                **raw_measurements.get((student_id, int(row["week"])), {}),
            }
        )

    for weeks in timelines.values():
        weeks.sort(key=lambda entry: entry["week"])

    current_week = max((int(row["week"]) for row in replay_rows), default=0)
    current_signals: dict[str, list[dict[str, Any]]] = {}
    for row in trajectory_rows:
        if int(row["week"]) != current_week:
            continue
        signals = []
        for column, label in SIGNAL_COLUMNS:
            z_score = float(row[f"{column}_z"])
            if z_score < 2.0:
                continue
            signals.append(
                {
                    "signal": label,
                    "z": number(z_score),
                    "risk": number(row[f"{column}_risk"]),
                    "strong": z_score >= 2.5,
                }
            )
        current_signals[row["student_id"]] = sorted(signals, key=lambda item: item["z"], reverse=True)

    cascades = {row["student_id"]: row for row in cascade_rows}
    students = []
    for card in cards:
        student_id = card["student_id"]
        weeks = timelines.get(student_id, [])
        if not weeks:
            raise ValueError(f"No replay data for {student_id}.")
        if len(weeks) != current_week:
            raise ValueError(f"{student_id} has {len(weeks)} weeks; expected {current_week}.")

        cascade = cascades.get(student_id, {})
        first_week = int(card["first_deviation_week"] or -1)
        students.append(
            {
                "id": student_id,
                "name": fictional_student_name(student_id),
                "rank": int(card["rank"]),
                "risk": number(card["current_risk_score"]),
                "severity": card["current_severity"],
                "trajectory": card["trajectory_state"],
                "phase": card["trajectory_phase"],
                "velocity": number(card["risk_velocity"], 2),
                "acceleration": number(card["risk_acceleration"], 2),
                "anomaly": number(card["population_anomaly"]),
                "confidence": card["confidence"],
                "signalCount": int(card["meaningful_signal_count"]),
                "firstDeviationWeek": first_week,
                "earliestSignal": card["earliest_signal"],
                "detectionType": card["deviation_detection_type"],
                "leadTimeWeeks": int(card["early_warning_lead_time_weeks"]),
                "weeksAboveWatch": int(card["weeks_above_watch"]),
                "weeksAboveModerate": int(card["weeks_above_moderate"]),
                "weeksAboveHigh": int(card["weeks_above_high"]),
                "contributors": [part.strip() for part in card["top_contributors"].split("|") if part.strip()],
                "explanation": card["explanation"],
                "signals": current_signals.get(student_id, []),
                "cascadeStartWeek": int(card["cascade_start_week"]),
                "cascadeEndWeek": int(card["cascade_end_week"]),
                "cascadeDuration": int(card["cascade_duration"]),
                "cascadeDepth": int(card["cascade_depth"]),
                "leadingSignal": card["leading_signal"],
                "secondSignal": card["second_signal"],
                "convergenceWeek": int(card["convergence_week"]),
                "convergenceStrength": number(card["convergence_strength"]),
                "earlyWarningWindow": int(card["early_warning_window"]),
                "signalOnsetOrder": parse_onset_order(card["signal_onset_order"]),
                "whyNow": card["why_now"],
                "weeks": weeks,
                "cascade": {
                    "startWeek": int(cascade.get("cascade_start_week", -1)),
                    "endWeek": int(cascade.get("cascade_end_week", -1)),
                    "depth": int(cascade.get("cascade_depth", 0)),
                    "leadingSignal": cascade.get("leading_signal", "NONE"),
                    "convergenceWeek": int(cascade.get("convergence_week", -1)),
                    "signalOnsetOrder": parse_onset_order(cascade.get("signal_onset_order", "")),
                },
            }
        )

    events = [
        {
            "studentId": row["student_id"],
            "week": int(row["week"]),
            "type": row["event_type"],
            "label": row["event_label"],
            "description": row["description"],
        }
        for row in event_rows
    ]
    transitions = [
        {
            "fromSignal": row["from_signal"],
            "fromLabel": row["from_label"],
            "toSignal": row["to_signal"],
            "toLabel": row["to_label"],
            "studentCount": int(row["observed_student_count"]),
            "meanLagWeeks": number(row["mean_lag_weeks"], 2),
            "medianLagWeeks": number(row["median_lag_weeks"], 2),
        }
        for row in transition_rows
    ]
    heatmap = [
        {
            "studentId": row["student_id"],
            "week": int(row["week"]),
            "signal": row["signal"],
            "label": row["signal_label"],
            "z": number(row["z_score"], 2),
            "risk": number(row["risk"]),
            "deviation": row["meaningful_deviation"].lower() == "true",
        }
        for row in heatmap_rows
    ]

    return {
        "generatedFrom": "Allen/wellbeing_outputs",
        "currentWeek": current_week,
        "baselineWeeks": 4,
        "studentCount": len(students),
        "students": students,
        "events": events,
        "transitions": transitions,
        "heatmap": heatmap,
    }


def main() -> None:
    payload = build()
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")

    size_kb = TARGET.stat().st_size / 1024
    print(f"Wrote {TARGET} ({size_kb:.0f} KB, {payload['studentCount']} students).")


if __name__ == "__main__":
    main()
