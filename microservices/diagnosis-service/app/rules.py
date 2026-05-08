"""Seed data for the DTC catalog. Loaded by scripts/seed_dtc.py.

The rule engine itself (symptoms keyword match, diagnose() function)
is added in the next commit. At this stage we only need the data so the
catalog has something to display.
"""

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
