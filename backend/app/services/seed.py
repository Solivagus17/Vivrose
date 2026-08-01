from datetime import date, datetime, timezone
from ..db import db
from ..models import FamilyMember, Doctor, Checkup, Medicine, Report, InsightSnapshot
from ..utils import gen_id

def seed_household_data(household_id):
    """Seed initial demo data for a newly initialized household into Supabase Postgres."""
    # Avoid duplicate seeding
    if FamilyMember.query.filter_by(household_id=household_id).first():
        return

    # Seed Family Members
    members_data = [
        {
            "id": "arjun",
            "name": "Arjun Sharma",
            "relation": "Self",
            "sex": "Male",
            "birth_date": date(1989, 4, 15),
            "birth_location": "Delhi, India",
            "location": "Mumbai, India",
            "initials": "AS",
            "age": 37,
            "avatar": "var(--emerald)",
            "level": "low",
            "risk": "Low Risk",
            "status": "Healthy / Low Risk",
            "bmi": "23.4",
            "bmi_class": "Normal",
            "bp": "118/76 mmHg",
            "hba1c": "5.4%",
            "glucose": "92 mg/dL",
            "cholesterol": "175 mg/dL",
            "creatinine": "0.9 mg/dL",
            "smoking": "Non-smoker",
            "conditions": ["Mild seasonal allergies"],
            "medications": ["Multivitamin OD"],
            "family_history": ["Father - Type 2 Diabetes", "Mother - Hypertension"],
            "scores": [
                {"label": "Diabetes Risk", "score": 18, "level": "low", "trend": "stable", "trendLabel": "Stable", "points": "15,16,17,18", "color": "#10b981"},
                {"label": "Hypertension", "score": 22, "level": "low", "trend": "stable", "trendLabel": "Stable", "points": "20,21,22,22", "color": "#10b981"},
                {"label": "CVD Risk", "score": 14, "level": "low", "trend": "improving", "trendLabel": "Improving", "points": "18,16,15,14", "color": "#10b981"},
            ],
            "factors": [
                {"name": "Regular Physical Activity", "value": "Optimal", "width": 85, "gradient": "linear-gradient(90deg,#10b981,#059669)", "impact": "low", "impactLabel": "Positive"},
                {"name": "Balanced Lipid Profile", "value": "Optimal", "width": 80, "gradient": "linear-gradient(90deg,#10b981,#059669)", "impact": "low", "impactLabel": "Positive"},
            ],
            "findings": ["All core physiological markers are within healthy reference ranges.", "Routine preventive screening recommended annually."],
            "summary": "<p>Arjun is maintaining an excellent health profile with optimal metabolic and cardiovascular markers.</p>",
            "report_summary": "<p>Recent comprehensive blood panel confirms normal glucose and lipids.</p>",
            "checkup_list": ["Annual Executive Health Checkup", "Dental Cleaning"],
            "recommendation_list": ["Maintain current exercise routine", "Annual lipid profile check"],
            "lifestyle": ["Cardio training 3x/week", "7-8 hours restful sleep daily"]
        },
        {
            "id": "kavya",
            "name": "Kavya Sharma",
            "relation": "Wife",
            "sex": "Female",
            "birth_date": date(1991, 8, 22),
            "birth_location": "Bangalore, India",
            "location": "Mumbai, India",
            "initials": "KS",
            "age": 35,
            "avatar": "var(--emerald)",
            "level": "low",
            "risk": "Low Risk",
            "status": "Healthy / Low Risk",
            "bmi": "21.8",
            "bmi_class": "Normal",
            "bp": "112/72 mmHg",
            "hba1c": "5.2%",
            "glucose": "88 mg/dL",
            "cholesterol": "165 mg/dL",
            "creatinine": "0.8 mg/dL",
            "smoking": "Non-smoker",
            "conditions": [],
            "medications": ["Calcium + Vitamin D3"],
            "family_history": ["Mother - Thyroid disorder"],
            "scores": [
                {"label": "Diabetes Risk", "score": 12, "level": "low", "trend": "stable", "trendLabel": "Stable", "points": "12,12,12,12", "color": "#10b981"},
                {"label": "Thyroid Profile Risk", "score": 25, "level": "low", "trend": "stable", "trendLabel": "Stable", "points": "22,24,25,25", "color": "#10b981"}
            ],
            "factors": [
                {"name": "Normal BMI & Metabolism", "value": "Optimal", "width": 90, "gradient": "linear-gradient(90deg,#10b981,#059669)", "impact": "low", "impactLabel": "Positive"}
            ],
            "findings": ["Excellent metabolic parameters.", "Thyroid function within normal range."],
            "summary": "<p>Kavya displays optimal overall vitality and normal metabolic parameters.</p>",
            "report_summary": "<p>Thyroid panel (TSH, T3, T4) normal.</p>",
            "checkup_list": ["Annual Well-Woman Screening", "Thyroid Profile Check"],
            "recommendation_list": ["Continue vitamin D supplementation", "Yoga & strength training"],
            "lifestyle": ["Daily morning yoga", "Plant-rich Mediterranean diet"]
        },
        {
            "id": "rajesh",
            "name": "Rajesh Sharma",
            "relation": "Father",
            "sex": "Male",
            "birth_date": date(1956, 11, 10),
            "birth_location": "Jaipur, India",
            "location": "Mumbai, India",
            "initials": "RS",
            "age": 70,
            "avatar": "var(--rose)",
            "level": "high",
            "risk": "High Risk",
            "status": "Action Required / High Risk",
            "bmi": "28.2",
            "bmi_class": "Overweight",
            "bp": "145/92 mmHg",
            "hba1c": "7.8%",
            "glucose": "158 mg/dL",
            "cholesterol": "225 mg/dL",
            "creatinine": "1.3 mg/dL",
            "smoking": "Former smoker (Quit 2012)",
            "conditions": ["Type 2 Diabetes", "Stage 1 Hypertension", "Mild Hyperlipidemia"],
            "medications": ["Metformin 500mg BD", "Telmisartan 40mg OD", "Atorvastatin 10mg HS"],
            "family_history": ["Father - Stroke", "Brother - Coronary Artery Disease"],
            "scores": [
                {"label": "Diabetes Complication Risk", "score": 76, "level": "high", "trend": "worsening", "trendLabel": "Needs Focus", "points": "68,70,74,76", "color": "#f43f5e"},
                {"label": "Hypertension Risk", "score": 68, "level": "high", "trend": "stable", "trendLabel": "Elevated", "points": "65,67,68,68", "color": "#f43f5e"},
                {"label": "CVD Risk", "score": 62, "level": "high", "trend": "stable", "trendLabel": "Monitored", "points": "60,61,62,62", "color": "#f43f5e"}
            ],
            "factors": [
                {"name": "Elevated HbA1c (7.8%)", "value": "High Impact", "width": 88, "gradient": "linear-gradient(90deg,#f43f5e,#e11d48)", "impact": "high", "impactLabel": "Critical"},
                {"name": "Systolic BP (145 mmHg)", "value": "Moderate Impact", "width": 72, "gradient": "linear-gradient(90deg,#f59e0b,#d97706)", "impact": "moderate", "impactLabel": "Elevated"}
            ],
            "findings": ["Sub-optimal glycemic control requiring medication review.", "Elevated blood pressure needs tight salt reduction."],
            "summary": "<p>Rajesh requires proactive clinical management for glycemic and blood pressure optimization.</p>",
            "report_summary": "<p>Recent HbA1c indicates need for medication dose calibration.</p>",
            "checkup_list": ["Quarterly Endocrinologist Consultation", "Diabetic Foot & Retinal Assessment", "Renal Panel"],
            "recommendation_list": ["Consult Endocrinologist for Metformin adjustment", "Daily BP log recording"],
            "lifestyle": ["Low-glycemic dietary plan", "Brisk evening walking 30 mins daily"]
        },
        {
            "id": "sunita",
            "name": "Sunita Sharma",
            "relation": "Mother",
            "sex": "Female",
            "birth_date": date(1960, 3, 18),
            "birth_location": "Delhi, India",
            "location": "Mumbai, India",
            "initials": "SS",
            "age": 66,
            "avatar": "var(--amber)",
            "level": "moderate",
            "risk": "Moderate Risk",
            "status": "Monitored / Moderate Risk",
            "bmi": "26.5",
            "bmi_class": "Overweight",
            "bp": "132/84 mmHg",
            "hba1c": "6.1%",
            "glucose": "112 mg/dL",
            "cholesterol": "205 mg/dL",
            "creatinine": "1.0 mg/dL",
            "smoking": "Non-smoker",
            "conditions": ["Pre-diabetes", "Mild Osteoarthritis (Knees)"],
            "medications": ["Glucosamine Sulfate OD", "Vitamin D3 60k IU Weekly"],
            "family_history": ["Mother - Osteoporosis"],
            "scores": [
                {"label": "Diabetes Progression Risk", "score": 45, "level": "moderate", "trend": "stable", "trendLabel": "Monitored", "points": "42,44,45,45", "color": "#f59e0b"},
                {"label": "Cardiovascular Risk", "score": 38, "level": "moderate", "trend": "stable", "trendLabel": "Moderate", "points": "36,37,38,38", "color": "#f59e0b"}
            ],
            "factors": [
                {"name": "Pre-diabetic Range HbA1c (6.1%)", "value": "Moderate", "width": 65, "gradient": "linear-gradient(90deg,#f59e0b,#d97706)", "impact": "moderate", "impactLabel": "Watch"},
            ],
            "findings": ["Pre-diabetic glycemic state manageable via lifestyle dietary intervention.", "Joint care recommended."],
            "summary": "<p>Sunita is in a manageable pre-diabetic state with early joint care requirements.</p>",
            "report_summary": "<p>Fasting blood sugar 112 mg/dL; HbA1c 6.1%.</p>",
            "checkup_list": ["Bi-annual HbA1c test", "Orthopedic knee checkup"],
            "recommendation_list": ["Physiotherapy exercises for knee strength", "Reduce simple carbohydrates"],
            "lifestyle": ["Low-impact swimming / water aerobics", "Calcium-rich diet"]
        },
        {
            "id": "aarav",
            "name": "Aarav Sharma",
            "relation": "Son",
            "sex": "Male",
            "birth_date": date(2018, 6, 5),
            "birth_location": "Mumbai, India",
            "location": "Mumbai, India",
            "initials": "AS",
            "age": 8,
            "avatar": "var(--emerald)",
            "level": "low",
            "risk": "Low Risk",
            "status": "Healthy / Low Risk",
            "bmi": "16.1",
            "bmi_class": "Normal",
            "bp": "95/62 mmHg",
            "hba1c": "5.0%",
            "glucose": "82 mg/dL",
            "cholesterol": "140 mg/dL",
            "creatinine": "0.5 mg/dL",
            "smoking": "Non-smoker",
            "conditions": [],
            "medications": ["Pediatric Multivitamin Gummies"],
            "family_history": ["Paternal Grandfather - Type 2 Diabetes"],
            "scores": [
                {"label": "General Pediatric Health", "score": 5, "level": "low", "trend": "stable", "trendLabel": "Optimal", "points": "5,5,5,5", "color": "#10b981"}
            ],
            "factors": [
                {"name": "Growth & Development Milestone", "value": "Optimal", "width": 95, "gradient": "linear-gradient(90deg,#10b981,#059669)", "impact": "low", "impactLabel": "Optimal"}
            ],
            "findings": ["All pediatric growth milestones fully met.", "Vaccination schedule fully up to date."],
            "summary": "<p>Aarav demonstrates excellent growth milestones and vibrant health.</p>",
            "report_summary": "<p>Routine pediatric checkup & growth chart normal.</p>",
            "checkup_list": ["Annual Pediatric Growth & Dental Review"],
            "recommendation_list": ["Ensure daily outdoor play", "Maintain balanced pediatric diet"],
            "lifestyle": ["Outdoor sports & swimming", "Balanced school nutrition"]
        }
    ]

    for m in members_data:
        db.session.add(FamilyMember(household_id=household_id, **m))
    db.session.flush()

    # Seed Doctors
    doctors_data = [
        {
            "id": "doc-seed-1",
            "household_id": household_id,
            "name": "Dr. Ananya Roy",
            "specialty": "Endocrinologist",
            "hospital": "Fortis Healthcare",
            "phone": "+91 98200 11223",
            "email": "dr.roy@fortishealth.com",
            "city": "Mumbai",
            "notes": "Primary specialist managing Rajesh's diabetes protocol."
        },
        {
            "id": "doc-seed-2",
            "household_id": household_id,
            "name": "Dr. Vikram Mehta",
            "specialty": "Cardiologist",
            "hospital": "Asian Heart Institute",
            "phone": "+91 98211 44556",
            "email": "vmehta@asianheart.org",
            "city": "Mumbai",
            "notes": "Cardiovascular risk evaluations and hypertension consultations."
        }
    ]
    for d in doctors_data:
        db.session.add(Doctor(**d))
    db.session.flush()

    # Seed Checkups
    checkups_data = [
        {
            "id": "chk-seed-1",
            "household_id": household_id,
            "doctor_id": "doc-seed-1",
            "doctor_name": "Dr. Ananya Roy",
            "purpose": "Quarterly HbA1c & Diabetic Review for Rajesh",
            "date": date(2026, 8, 15),
            "time": "10:30",
            "location": "Fortis OPD Room 204",
            "notes": "Bring latest fasting glucose logs.",
            "status": "Scheduled"
        },
        {
            "id": "chk-seed-2",
            "household_id": household_id,
            "doctor_id": "doc-seed-2",
            "doctor_name": "Dr. Vikram Mehta",
            "purpose": "Routine ECG & BP Checkup for Sunita",
            "date": date(2026, 9, 2),
            "time": "11:00",
            "location": "Asian Heart Institute OPD",
            "notes": "Bi-annual cardiovascular preventive visit.",
            "status": "Scheduled"
        }
    ]
    for c in checkups_data:
        db.session.add(Checkup(**c))

    # Seed Medicines
    medicines_data = [
        {
            "id": "med-seed-1",
            "household_id": household_id,
            "name": "Metformin Hydrochloride",
            "purpose": "Glycemic Control (Rajesh)",
            "dosage": "500 mg",
            "frequency": "Twice Daily (BD)",
            "timing": "After Meals",
            "prescribed_by": "Dr. Ananya Roy",
            "start_date": date(2025, 1, 10),
            "status": "Active",
            "remark": "Take with breakfast and dinner."
        },
        {
            "id": "med-seed-2",
            "household_id": household_id,
            "name": "Telmisartan",
            "purpose": "Blood Pressure Management (Rajesh)",
            "dosage": "40 mg",
            "frequency": "Once Daily (OD)",
            "timing": "Morning",
            "prescribed_by": "Dr. Vikram Mehta",
            "start_date": date(2025, 3, 5),
            "status": "Active",
            "remark": "Monitor morning blood pressure."
        }
    ]
    for med in medicines_data:
        db.session.add(Medicine(**med))

    # Seed Reports
    reports_data = [
        {
            "id": "rep-seed-1",
            "household_id": household_id,
            "file_name": "Rajesh_HbA1c_Blood_Panel_July2026.pdf",
            "file_size": "1.4 MB",
            "report_type": "Blood Test",
            "date": date(2026, 7, 20),
            "hospital": "Metropolis Healthcare",
            "doctor": "Dr. Ananya Roy",
            "purpose": "Diabetic Control Evaluation",
            "remark": "HbA1c 7.8%, Fasting Glucose 158 mg/dL.",
            "storage_path": "demo/Rajesh_HbA1c_Blood_Panel_July2026.pdf"
        }
    ]
    for r in reports_data:
        db.session.add(Report(**r))

    # Seed Insight Snapshots
    snapshot_dict = dict(members_data[2])
    snapshot_dict["birth_date"] = "1956-11-10"
    db.session.add(InsightSnapshot(
        id=gen_id("snap"),
        household_id=household_id,
        member_id="rajesh",
        member_name="Rajesh Sharma",
        member_initials="RS",
        snapshot=snapshot_dict,
        created_at=datetime.now(timezone.utc)
    ))

    db.session.commit()
