"""Rule engine for diagnostic suggestions.

Given an OBD-II DTC code and/or a free-text symptoms string, return a
probable cause and a recommended action. The DTC catalog lives in MongoDB
and is the primary source. Symptoms are matched against a small keyword
table for cases where the user does not have a code.
"""

from typing import Optional


# Seed data for the DTC catalog. Loaded by scripts/seed_dtc.py.
DTC_SEED: list[dict] = [
    {
        "code": "P0300",
        "title": "Random/Multiple Cylinder Misfire",
        "probable_cause": "Worn spark plugs, faulty ignition coils, or fuel delivery issues.",
        "recommended_action": "Inspect spark plugs and coils. Check fuel pressure and injectors.",
    },
    {
        "code": "P0301",
        "title": "Cylinder 1 Misfire Detected",
        "probable_cause": "Faulty spark plug or ignition coil on cylinder 1.",
        "recommended_action": "Swap coil/plug with another cylinder; replace if the misfire follows.",
    },
    {
        "code": "P0303",
        "title": "Cylinder 3 Misfire Detected",
        "probable_cause": "Faulty spark plug or ignition coil on cylinder 3.",
        "recommended_action": "Swap coil/plug with another cylinder; replace if the misfire follows.",
    },
    {
        "code": "P0171",
        "title": "System Too Lean (Bank 1)",
        "probable_cause": "Vacuum leak, weak fuel pump, or dirty MAF sensor.",
        "recommended_action": "Smoke test for vacuum leaks; clean MAF; verify fuel pressure.",
    },
    {
        "code": "P0420",
        "title": "Catalyst System Efficiency Below Threshold (Bank 1)",
        "probable_cause": "Aging catalytic converter or faulty oxygen sensor.",
        "recommended_action": "Test downstream O2 sensor first; replace catalytic converter if needed.",
    },
    {
        "code": "P0128",
        "title": "Coolant Temperature Below Thermostat Regulating Temperature",
        "probable_cause": "Stuck-open thermostat or faulty coolant temperature sensor.",
        "recommended_action": "Replace thermostat; verify with coolant temp sensor reading.",
    },
    {
        "code": "P0455",
        "title": "Evaporative Emission System Leak Detected (Large Leak)",
        "probable_cause": "Loose or damaged fuel cap, cracked EVAP hose, or bad purge valve.",
        "recommended_action": "Tighten/replace fuel cap; smoke test EVAP system.",
    },
    {
        "code": "P0011",
        "title": "Camshaft Position - Timing Over-Advanced (Bank 1)",
        "probable_cause": "Low oil pressure, faulty VVT solenoid, or stretched timing chain.",
        "recommended_action": "Check oil level and condition; test/replace VVT solenoid.",
    },
    {
        "code": "P0102",
        "title": "Mass Air Flow Sensor Circuit Low Input",
        "probable_cause": "Dirty or failing MAF sensor, intake leak, or wiring fault.",
        "recommended_action": "Clean MAF with proper cleaner; inspect intake boot and connector.",
    },
    {
        "code": "P0507",
        "title": "Idle Air Control System RPM Higher Than Expected",
        "probable_cause": "Vacuum leak or carbon buildup on throttle body.",
        "recommended_action": "Clean throttle body; smoke test for vacuum leaks.",
    },
]


# Keyword -> (probable cause, recommended action)
SYMPTOM_RULES: list[tuple[list[str], str, str]] = [
    (
        ["misfire", "shaking", "rough idle", "stutter"],
        "Possible ignition or fuel delivery problem causing a misfire.",
        "Scan for DTCs; inspect spark plugs, coils, and fuel injectors.",
    ),
    (
        ["overheat", "hot", "temperature high", "steam"],
        "Cooling system fault: low coolant, failing thermostat, or bad water pump.",
        "Stop driving. Check coolant level and look for leaks; pressure test the system.",
    ),
    (
        ["check engine", "engine light", "cel"],
        "Generic ECU fault. The exact cause requires a DTC scan.",
        "Use an OBD-II scanner to read the trouble code, then re-submit it here.",
    ),
    (
        ["smoke", "burning smell", "white smoke", "blue smoke"],
        "Possible oil or coolant burning in the combustion chamber.",
        "Check oil and coolant levels; have a mechanic inspect for head gasket failure.",
    ),
    (
        ["battery", "won't start", "wont start", "no crank", "click"],
        "Likely a weak battery, bad starter, or loose terminal.",
        "Test battery voltage; clean terminals; load-test the starter.",
    ),
    (
        ["brake", "squeal", "grinding", "soft pedal"],
        "Brake wear or hydraulic problem.",
        "Inspect pads, rotors, and brake fluid level immediately.",
    ),
    (
        ["transmission", "slipping", "shift", "jerk"],
        "Transmission fluid level or solenoid issue.",
        "Check transmission fluid level and condition; have it scanned for codes.",
    ),
]


def _match_symptoms(symptoms: str) -> Optional[tuple[str, str]]:
    text = symptoms.lower()
    for keywords, cause, action in SYMPTOM_RULES:
        if any(k in text for k in keywords):
            return cause, action
    return None


async def diagnose(
    dtc_collection,
    dtc: Optional[str],
    symptoms: Optional[str],
) -> tuple[str, str]:
    """Return (probable_cause, recommended_action). Never raises - always
    returns something usable so the user gets a response."""
    if dtc:
        doc = await dtc_collection.find_one({"code": dtc.upper().strip()})
        if doc:
            return doc["probable_cause"], doc["recommended_action"]

    if symptoms:
        match = _match_symptoms(symptoms)
        if match:
            return match

    return (
        "Not enough information to identify a specific cause.",
        "Provide a valid OBD-II code or describe the symptoms in more detail.",
    )
