import json

cases = [
    {
        "id": "case-001", "title": "Acute Chest Pain", "specialty": "Cardiology", "difficulty": "intermediate", "timeLimit": 30, "tags": ["chest pain", "STEMI", "emergency"],
        "emoji": "👨🏽‍🦳", "age": 52, "sex": "male", "name": "Kamal Perera",
        "complaint": "crushing chest pain for the last 2 hours", "background": "Known hypertensive, smoker",
        "dx": "STEMI", "diff": ["NSTEMI", "PE", "aortic dissection"],
        "h_keys": ["Onset and duration", "Radiation to arm/jaw", "Associated sweating/nausea", "Cardiac risk factors"], "h_reds": ["Syncope", "Severe tearing pain"],
        "e_keys": ["Vital signs", "Heart sounds", "JVP", "Chest auscultation"], "e_reds": ["Hypotension", "Signs of heart failure"],
        "i_keys": ["12-lead ECG", "Troponin", "Chest X-ray", "UEC"], "i_reds": ["ST elevation"],
        "m_keys": ["Aspirin 300mg", "Oxygen if sats <94%", "Activate cath lab / PCI", "Morphine"], "m_reds": []
    },
    {
        "id": "case-002", "title": "Diabetic Ketoacidosis", "specialty": "Endocrinology", "difficulty": "intermediate", "timeLimit": 35, "tags": ["DKA", "diabetes", "emergency", "metabolic"],
        "emoji": "👩🏽", "age": 19, "sex": "female", "name": "Nimali Silva",
        "complaint": "vomiting and feeling very unwell for the past day", "background": "Type 1 diabetes, missed insulin due to exams",
        "dx": "DKA", "diff": ["HHS", "gastroenteritis", "alcohol ketoacidosis"],
        "h_keys": ["Insulin compliance", "Polyuria/polydipsia", "Vomiting frequency", "Precipitating factors"], "h_reds": ["Reduced consciousness", "Kussmaul breathing"],
        "e_keys": ["Vital signs", "Signs of dehydration", "Respiratory pattern", "Abdominal examination"], "e_reds": ["Hypotension", "Reduced GCS"],
        "i_keys": ["Capillary blood glucose", "Arterial blood gas", "Urinary ketones", "UEC"], "i_reds": ["pH below 7.3", "Ketones above 3"],
        "m_keys": ["IV fluid resuscitation 0.9% NaCl", "Fixed rate insulin", "Potassium replacement", "Hourly monitoring"], "m_reds": []
    },
    {
        "id": "case-003", "title": "Community Acquired Pneumonia", "specialty": "Respiratory", "difficulty": "beginner", "timeLimit": 25, "tags": ["pneumonia", "respiratory", "infection"],
        "emoji": "👴🏽", "age": 67, "sex": "male", "name": "Sunil Fernando",
        "complaint": "cough with yellow sputum and fever for 4 days", "background": "Retired teacher, ex-smoker, mild COPD",
        "dx": "Community acquired pneumonia", "diff": ["PE", "lung cancer", "TB"],
        "h_keys": ["Cough and sputum", "Fever/rigors", "Breathlessness", "Pleuritic chest pain"], "h_reds": ["Haemoptysis", "Confusion"],
        "e_keys": ["Temperature and sats", "Respiratory rate", "Chest expansion", "Auscultation"], "e_reds": ["Oxygen sat < 92%", "RR > 30"],
        "i_keys": ["Chest X-ray", "FBC, CRP", "Blood cultures", "Sputum culture"], "i_reds": ["Consolidation on CXR", "Urea > 7"],
        "m_keys": ["Oxygen", "Antibiotics (amoxicillin + clarithromycin)", "IV fluids", "Analgesia"], "m_reds": []
    },
    {
        "id": "case-004", "title": "Acute Appendicitis", "specialty": "Gastroenterology", "difficulty": "beginner", "timeLimit": 25, "tags": ["appendicitis", "acute abdomen", "surgery"],
        "emoji": "👩🏽", "age": 23, "sex": "female", "name": "Sanduni Perera",
        "complaint": "worsening right sided abdominal pain for 18 hours, nausea", "background": "No significant medical history, LMP 2 weeks ago",
        "dx": "Acute appendicitis", "diff": ["Ovarian cyst", "Ectopic pregnancy", "Mesenteric adenitis"],
        "h_keys": ["Pain migration periumbilical to RIF", "Nausea/vomiting", "Urinary symptoms", "LMP/sexual history"], "h_reds": ["Generalised peritonism", "Rigid abdomen"],
        "e_keys": ["Vital signs", "McBurney's point tenderness", "Rebound tenderness", "Rovsing's sign"], "e_reds": ["Guarding", "Signs of peritonitis"],
        "i_keys": ["FBC", "CRP", "Urine pregnancy test", "Ultrasound abdomen"], "i_reds": ["Positive pregnancy test changes mx"],
        "m_keys": ["Nil by mouth", "IV fluids", "IV antibiotics", "Surgical referral"], "m_reds": []
    },
    {
        "id": "case-005", "title": "First Seizure in a Young Adult", "specialty": "Neurology", "difficulty": "advanced", "timeLimit": 40, "tags": ["seizure", "epilepsy", "neurology", "first presentation"],
        "emoji": "👨🏽", "age": 21, "sex": "male", "name": "Kasun Silva",
        "complaint": "collapsed and shaking at a party, now drowsy", "background": "No medical history, admits to alcohol and energy drinks tonight",
        "dx": "First generalised tonic-clonic seizure", "diff": ["Syncope", "Psychogenic non-epileptic seizure", "Hypoglycaemia"],
        "h_keys": ["Eyewitness account", "Duration of convulsion", "Post-ictal period", "Alcohol/drug use"], "h_reds": ["Prolonged seizure", "Focal neurology"],
        "e_keys": ["GCS", "Vital signs", "Full neurological exam", "Signs of head injury"], "e_reds": ["Focal neurological deficit", "Papilloedema"],
        "i_keys": ["Blood glucose", "FBC, UEC, LFT", "CT head", "EEG outpatient"], "i_reds": ["Hypoglycaemia", "Hyponatraemia"],
        "m_keys": ["Observe until recovered", "Correct metabolic abnormalities", "Neurology referral", "DVLA advice"], "m_reds": []
    }
]

# Provide additional 45 cases
additional_diseases = [
    # Beginner: 15 cases (Total beginner: 18)
    ("Acute Asthma Exacerbation", "Respiratory", "beginner", 25, ["asthma", "wheeze", "respiratory"], "👩🏼", 24, "female", "Lucy Evans", "worsening breathlessness and wheeze for 2 days", "Known asthmatic on salbutamol PRN, no past ICU admissions. Recent upper respiratory tract infection.", "Acute asthma exacerbation", ["Anaphylaxis", "Pneumothorax", "Pneumonia"]),
    ("Gastroenteritis", "Gastroenterology", "beginner", 20, ["diarrhea", "vomiting", "infection"], "👨🏼‍🦱", 30, "male", "Mark Johnson", "profuse watery diarrhea and vomiting for 24 hours", "Ate leftover chicken 36 hours ago. Otherwise healthy.", "Infective gastroenteritis", ["Food poisoning", "IBD flare", "Hyperthyroidism"]),
    ("Urinary Tract Infection", "Urology", "beginner", 20, ["dysuria", "frequency", "infection"], "👵🏼", 65, "female", "Mary Smith", "pain on passing urine and going to toilet frequently", "Type 2 diabetes, previous UTIs.", "Lower UTI", ["Pyelonephritis", "Asymptomatic bacteriuria", "Vaginitis"]),
    ("Cellulitis", "Dermatology", "beginner", 20, ["skin", "infection", "red leg"], "👨👴", 55, "male", "John Doe", "red, hot, swollen right lower leg for 3 days", "Type 2 diabetes, peripheral vascular disease. Suffered a minor scratch last week.", "Cellulitis", ["DVT", "Venous eczema", "Necrotising fasciitis"]),
    ("Deep Vein Thrombosis", "Vascular", "beginner", 25, ["leg swelling", "clot", "vascular"], "👩🏻", 45, "female", "Sarah Lee", "unilateral painful swollen left calf for 2 days", "Recent long haul flight (14 hours). On oral contraceptive pill.", "DVT", ["Cellulitis", "Ruptured Baker's cyst", "Muscle tear"]),
    ("Renal Colic", "Urology", "beginner", 25, ["loin pain", "stone", "emergency"], "👨🏽", 38, "male", "David Rajan", "sudden onset severe right loin to groin pain, pacing around", "Previous episode of kidney stones 5 years ago. Low fluid intake.", "Ureteric colic (Renal stone)", ["Appendicitis", "AAA leak", "Pyelonephritis"]),
    ("Migraine", "Neurology", "beginner", 20, ["headache", "aura", "neurology"], "👩🏽", 28, "female", "Priya Patel", "severe right sided throbbing headache with photophobia", "History of migraines with aura. Triggered by stress and missed meals.", "Migraine with aura", ["Tension headache", "Cluster headache", "SAH"]),
    ("Gout Flare", "Rheumatology", "beginner", 20, ["joint pain", "toe", "arthritis"], "👨🏼‍🦳", 60, "male", "Arthur White", "woke up with extremely painful, red, swollen right big toe", "Hypertension on bendroflumethiazide. Drinks 3-4 pints of beer daily.", "Acute gout", ["Septic arthritis", "Pseudogout", "Cellulitis"]),
    ("Tension Headache", "Neurology", "beginner", 20, ["headache", "stress", "neurology"], "👩🏼", 35, "female", "Emma Clark", "band-like headache around head for last week", "Works as accountant, current tax season, poor sleep, high stress.", "Tension-type headache", ["Migraine", "Brain tumour", "Temporal arteritis"]),
    ("Viral Tonsillitis", "ENT", "beginner", 20, ["sore throat", "fever", "infection"], "👦🏻", 16, "male", "Kevin Wong", "severe sore throat, pain on swallowing, and mild fever", "No significant past medical history, unwell sick contacts at school.", "Viral tonsillitis", ["Strep throat", "Epstein-Barr virus / Mononucleosis", "Quinsy"]),
    ("Iron Deficiency Anemia", "Hematology", "beginner", 25, ["fatigue", "anemia", "blood"], "👩🏾", 42, "female", "Grace Ofori", "feeling constantly tired and short of breath on exertion", "Heavy menstrual bleeding, diet low in red meat.", "Iron deficiency anemia", ["B12 deficiency", "Hypothyroidism", "Thalassemia trait"]),
    ("Stable Angina", "Cardiology", "beginner", 25, ["chest pain", "exertional", "cardiology"], "👴🏼", 68, "male", "Robert Brown", "central chest tightness brought on by walking uphill, relieved by rest", "Hypertension, Hyperlipidemia, ex-smoker 30 pack years.", "Stable Angina", ["ACS", "GERD", "Musculoskeletal pain"]),
    ("Hypothyroidism", "Endocrinology", "beginner", 25, ["weight gain", "fatigue", "thyroid"], "👩🏻", 50, "female", "Ling Chen", "weight gain, feeling cold constantly, and constipation over 6 months", "No significant past medical history.", "Primary Hypothyroidism", ["Depression", "Menopause", "Chronic fatigue syndrome"]),
    ("Benign Prostatic Hyperplasia", "Urology", "beginner", 25, ["urinary", "prostate", "LUTS"], "👴🏾", 70, "male", "James Williams", "poor urine flow, hesitancy, and going to the toilet 4 times a night", "Hypertension, borderline diabetes.", "BPH", ["Prostate cancer", "UTI", "Overactive bladder"]),
    ("Viral Upper Respiratory Tract Infection", "Primary Care", "beginner", 15, ["cough", "cold", "viral"], "👩🏼", 25, "female", "Chloe Smith", "runny nose, mild sore throat, and dry cough for 3 days", "Otherwise fit and well.", "Viral URI (Common Cold)", ["Allergic rhinitis", "COVID-19", "Influenza"]),
    
    # Intermediate: 20 cases (Total intermediate: 22)
    ("Pulmonary Embolism", "Respiratory", "intermediate", 30, ["breathless", "pleuritic pain", "clot"], "👩🏽", 40, "female", "Nina Gupta", "sudden onset breathlessness and left sided pleuritic chest pain", "Recent knee surgery 3 weeks ago, currently immobile.", "Pulmonary Embolism", ["Pneumonia", "ACS", "Pneumothorax"]),
    ("Transient Ischemic Attack", "Neurology", "intermediate", 30, ["weakness", "stroke", "neurology"], "👴🏻", 72, "male", "George Taylor", "had right sided weakness and slurred speech lasting 30 minutes, now resolved", "Atrial fibrillation not on anticoagulation, hypertension.", "TIA", ["Stroke", "Todd's paresis", "Hypoglycaemia"]),
    ("Acute Pancreatitis", "Gastroenterology", "intermediate", 30, ["abdominal pain", "alcohol", "gallstones"], "👨🏼‍🦱", 48, "male", "Steven Davis", "severe epigastric pain radiating to back, vomiting multiple times", "Heavy alcohol intake, known gallstones.", "Acute Pancreatitis", ["Peptic ulcer perforation", "Cholecystitis", "AAA rupture"]),
    ("Chronic Obstructive Pulmonary Disease Exacerbation", "Respiratory", "intermediate", 30, ["breathless", "sputum", "COPD"], "👴🏼", 75, "male", "William Jones", "worsening breathlessness, wheeze, and green sputum for 3 days", "Known COPD, 50 pack year smoking history, on home oxygen.", "Infective exacerbation of COPD", ["Heart failure", "Pneumonia", "PE"]),
    ("Decompensated Heart Failure", "Cardiology", "intermediate", 35, ["edema", "dyspnea", "cardiology"], "👨🏾‍🦳", 78, "male", "Joseph Ali", "increasing shortness of breath, orthopnea, and swollen ankles over 2 weeks", "Ischemic heart disease, previous anterior MI, on furosemide.", "Decompensated congestive heart failure", ["COPD exacerbation", "Renal failure", "PE"]),
    ("Acute Cholecystitis", "Surgery", "intermediate", 30, ["RUQ pain", "gallstones", "surgery"], "👩🏼", 45, "female", "Anna Miller", "fever and constant severe right upper quadrant pain for 12 hours", "Known gallstones, multiparous.", "Acute Cholecystitis", ["Biliary colic", "Pancreatitis", "Peptic ulcer disease"]),
    ("Ectopic Pregnancy", "Obstetrics & Gynaecology", "intermediate", 30, ["abdominal pain", "pregnancy", "emergency"], "👩🏻", 26, "female", "Rachel Wong", "sharp lower abdominal pain and light vaginal spotting", "Sexually active, unsure of last menstrual period, history of PID.", "Ectopic Pregnancy", ["Appendicitis", "Ovarian cyst rupture", "Miscarriage"]),
    ("Peptic Ulcer Disease Bleed", "Gastroenterology", "intermediate", 35, ["hematemesis", "melena", "bleed"], "👨🏼", 60, "male", "Thomas Jackson", "vomited coffee-ground like material twice, black tarry stools", "Osteoarthritis, takes regular ibuprofen, smokes 20/day.", "Upper GI Bleed secondary to PUD", ["Variceal bleed", "Gastric cancer", "Mallory-Weiss tear"]),
    ("Rheumatoid Arthritis Flare", "Rheumatology", "intermediate", 25, ["joint pain", "stiffness", "autoimmune"], "👩🏾", 35, "female", "Diana Osei", "painful, swollen small joints of both hands, morning stiffness lasting 2 hours", "Diagnosed 2 years ago, non-compliant with MTX.", "Rheumatoid arthritis flare", ["Osteoarthritis", "Systemic lupus erythematosus", "Psoriatic arthritis"]),
    ("Pyelonephritis", "Urology", "intermediate", 30, ["fever", "loin pain", "infection"], "👩🏼", 30, "female", "Emily Wilson", "fevers, rigors, right flank pain and dysuria for 2 days", "Previous UTIs, sexually active.", "Acute Pyelonephritis", ["Renal colic", "Lower UTI", "Pelvic inflammatory disease"]),
    ("Hypertensive Emergency", "Cardiology", "intermediate", 35, ["headache", "blood pressure", "emergency"], "👨🏽‍🦳", 58, "male", "Rajiv Kumar", "severe headache, blurred vision, and confusion", "Non-compliant with anti-hypertensives for 6 months.", "Hypertensive emergency", ["Stroke", "SAH", "Phaeochromocytoma"]),
    ("Inflammatory Bowel Disease Flare", "Gastroenterology", "intermediate", 30, ["diarrhea", "blood", "IBD"], "👩🏻", 28, "female", "Mei Lin", "passing 6-8 bloody, loose stools daily with crampy abdominal pain", "Known Ulcerative Colitis.", "Ulcerative Colitis Flare", ["Infective gastroenteritis", "Crohn's disease", "Colorectal cancer"]),
    ("Atrial Fibrillation with RVR", "Cardiology", "intermediate", 35, ["palpitations", "arrhythmia", "cardiology"], "👴🏼", 68, "male", "Frank Harper", "sudden onset fast irregular heart beat and feeling lightheaded", "Hypertension, ischemic heart disease.", "Atrial Fibrillation with Rapid Ventricular Response", ["SVT", "Sinus tachycardia", "Ventricular tachycardia"]),
    ("Bell's Palsy", "Neurology", "intermediate", 25, ["facial weakness", "neurology", "nerve"], "👨🏼", 40, "male", "Daniel Scott", "woke up with right sided facial droop, unable to close right eye", "Recent viral URI. Otherwise fit and well.", "Bell's Palsy", ["Stroke", "Lyme disease", "Ramsay Hunt syndrome"]),
    ("Acute Kidney Injury", "Nephrology", "intermediate", 35, ["oliguria", "renal", "AKI"], "👴🏾", 75, "male", "Clement Okafor", "reduced urine output and feeling extremely lethargic over 3 days", "Hypertension on ACE inhibitor, recent bout of D&V.", "Pre-renal AKI (Dehydration + ACEi)", ["Post-renal obstruction", "Intrinsic renal disease (ATN)", "Heart failure"]),
    ("Thyrotoxicosis", "Endocrinology", "intermediate", 30, ["weight loss", "palpitations", "thyroid"], "👩🏼", 32, "female", "Jessica Turner", "tremor, sweating, weight loss despite increased appetite, palpitations", "No past medical history. Exopthalmos noted on examination.", "Graves' Disease (Thyrotoxicosis)", ["Anxiety", "Pheochromocytoma", "Malignancy"]),
    ("Osteoporosis with Vertebral Crush Fracture", "Rheumatology", "intermediate", 25, ["back pain", "fracture", "bone"], "👵🏼", 80, "female", "Elizabeth Clark", "sudden sharp mid-back pain while lifting a small box", "Post-menopausal, previous Colles fracture.", "Osteoporotic vertebral crush fracture", ["Metastatic bone disease", "Multiple myeloma", "Muscular spasm"]),
    ("Meniere's Disease", "ENT", "intermediate", 25, ["vertigo", "tinnitus", "hearing"], "👨🏻", 50, "male", "Liang Wei", "episodes of severe room-spinning dizziness, ringing in left ear, and hearing loss", "Otherwise healthy.", "Meniere's Disease", ["BPPV", "Vestibular neuritis", "Acoustic neuroma"]),
    ("Acute Angle Closure Glaucoma", "Ophthalmology", "intermediate", 30, ["eye pain", "vision", "emergency"], "👵🏽", 65, "female", "Leela Patel", "severe left eye pain, blurred vision, seeing halos around lights, and nausea", "Hypermetropia (long-sighted). Sent from optician.", "Acute Angle Closure Glaucoma", ["Conjunctivitis", "Anterior uveitis", "Corneal ulcer"]),
    ("Gastroesophageal Reflux Disease", "Gastroenterology", "beginner", 20, ["heartburn", "acid", "GI"], "👨🏾", 50, "male", "Samuel Okafor", "burning chest pain after meals, acidic taste in mouth", "Obesity, frequent spicy food and late night eating.", "GERD", ["Angina", "Peptic ulcer disease", "Esophageal spasm"]),

    # Advanced: 15 cases (Total advanced: 16)
    ("Sepsis Unknown Origin", "Emergency", "advanced", 45, ["sepsis", "shock", "infection"], "👵🏼", 82, "female", "Margaret Brown", "found confused on the floor by neighbor, hot to touch", "Dementia, Type 2 Diabetes, frequent UTIs.", "Sepsis (Likely urinary source)", ["Stroke", "Hypoglycaemia", "Hypothermia"]),
    ("Acute Subarachnoid Hemorrhage", "Nephrology", "advanced", 40, ["headache", "thunderclap", "neurology"], "👨🏼", 45, "male", "Edward Baker", "sudden onset 'worst headache of my life' at the back of the head, vomited once", "Hypertension, smoker.", "Subarachnoid Hemorrhage", ["Migraine", "Meningitis", "Venous sinus thrombosis"]),
    ("Meningococcal Septicemia", "Infectious Disease", "advanced", 40, ["rash", "fever", "meningitis"], "👦🏼", 19, "male", "Tom Harris", "high fever, neck stiffness, photophobia and a non-blanching purpuric rash", "First year university student living in halls.", "Meningococcal Septicemia / Meningitis", ["Viral meningitis", "Encephalitis", "ITP"]),
    ("Aortic Dissection", "Vascular", "advanced", 45, ["chest pain", "tearing", "emergency"], "👨🏽‍🦳", 65, "male", "Ahmed Khan", "sudden catastrophic tearing chest pain radiating straight through to the back", "Poorly controlled hypertension, Marfan syndrome trait.", "Acute Aortic Dissection", ["STEMI", "PE", "Esophageal rupture"]),
    ("Status Epilepticus", "Neurology", "advanced", 40, ["seizure", "epilepsy", "emergency"], "👨🏻", 30, "male", "Wei Chen", "continuous tonic-clonic seizing for over 10 minutes", "Known epilepsy, ran out of anti-epileptic medication 3 days ago.", "Status Epilepticus", ["Pseudoseizure", "Eclampsia", "Encephalitis"]),
    ("Hyperosmolar Hyperglycemic State", "Endocrinology", "advanced", 40, ["diabetes", "confusion", "HHS"], "👴🏾", 75, "male", "Adebayo Johnson", "increasing confusion, severe dehydration, polyuria over the last week", "Type 2 diabetes, lives alone, poor fluid intake during recent heatwave.", "HHS", ["DKA", "Sepsis", "Stroke"]),
    ("Myocardial Infarction with Cardiogenic Shock", "Cardiology", "advanced", 45, ["chest pain", "shock", "STEMI"], "👨🏼‍🦳", 62, "male", "Richard White", "severe central chest pain, cold, clammy, confused, unrecordable BP", "Previous MI, heavy smoker, hyperlipidemia.", "STEMI + Cardiogenic Shock", ["Massive PE", "Aortic dissection", "Septic shock"]),
    ("Guillain-Barre Syndrome", "Neurology", "advanced", 40, ["weakness", "neurology", "paralysis"], "👨🏽", 35, "male", "Vikram Singh", "ascending symmetrical muscle weakness starting in legs, now affecting arms, areflexia", "Recent campylobacter gastroenteritis 2 weeks ago.", "Guillain-Barre Syndrome", ["Multiple sclerosis", "Transverse myelitis", "Myasthenia gravis"]),
    ("Necrotising Fasciitis", "Surgery", "advanced", 40, ["skin", "infection", "emergency"], "👨🏼", 55, "male", "Colin Davies", "severe, disproportionate pain in right lower leg, rapidly spreading purple discoloration", "Type 2 diabetes, IV drug user.", "Necrotising Fasciitis", ["Cellulitis", "DVT", "Compartment syndrome"]),
    ("Thyroid Storm", "Endocrinology", "advanced", 40, ["thyroid", "emergency", "fever"], "👩🏻", 29, "female", "Mei-Ling Yao", "high fever 40°C, extreme agitation, severe tachycardia (160 bpm)", "Known Graves' disease, stopped carbimazole due to side effects.", "Thyroid Storm", ["Sepsis", "Sympathomimetic overdose", "Pheochromocytoma"]),
    ("Addisonian Crisis", "Endocrinology", "advanced", 40, ["shock", "steroid", "emergency"], "👩🏼", 40, "female", "Sarah Jenkins", "profound vomiting, severe abdominal pain, dizzy on standing, profound hypotension", "Known Addison's disease, recent bout of flu, did not double steroid dose.", "Addisonian Crisis", ["Sepsis", "Acute abdomen", "Myocardial infarction"]),
    ("Massive Gastrointestinal Hemorrhage (Varices)", "Gastroenterology", "advanced", 45, ["bleeding", "liver", "cirrhosis"], "👨🏾", 55, "male", "Kofi Annan", "vomiting large amounts of bright red blood, hemodynamically unstable", "Alcoholic liver cirrhosis, portal hypertension.", "Ruptured Esophageal Varices", ["Bleeding peptic ulcer", "Mallory-Weiss tear", "Aortoenteric fistula"]),
    ("Acute Respiratory Distress Syndrome (ARDS)", "Intensive Care", "advanced", 45, ["respiratory", "failure", "ICU"], "👨🏼‍🦱", 45, "male", "Chris Wood", "profound, refractory hypoxemia, bilateral pulmonary infiltrates", "Admitted 3 days ago with severe acute pancreatitis.", "ARDS", ["Cardiogenic pulmonary edema", "Bilateral pneumonia", "Massive PE"]),
    ("Tumor Lysis Syndrome", "Oncology", "advanced", 45, ["oncology", "renal", "metabolic"], "👦🏻", 14, "male", "Jin Park", "oliguric, muscle cramps, and arrhythmias 2 days after starting chemotherapy", "Recently diagnosed with Burkitt Lymphoma.", "Tumor Lysis Syndrome", ["Acute kidney injury (other causes)", "Sepsis", "Hyperkalemia due to other causes"]),
    ("Hepatic Encephalopathy", "Gastroenterology", "advanced", 40, ["liver", "confusion", "cirrhosis"], "👴🏼", 66, "male", "Alan Stone", "fluctuating confusion, day/night reversal, flapping tremor (asterixis)", "Known hepatitis C cirrhosis. Constipated for 4 days.", "Hepatic Encephalopathy", ["Subdural hematoma", "Alcohol withdrawal", "Wernicke's encephalopathy"])
]

# Generate detailed fields for all additional cases
for p in additional_diseases:
    title, spec, diff, duration, tags, emoji, age, sex, name, complaint, bg, dx, d_diffs = p
    
    case = {
        "id": f"case-auto-{title.lower().replace(' ', '-')}",
        "title": title,
        "specialty": spec,
        "difficulty": diff,
        "timeLimit": duration,
        "tags": tags,
        "emoji": emoji,
        "age": age,
        "sex": sex,
        "name": name,
        "complaint": complaint,
        "background": bg,
        "dx": dx,
        "diff": d_diffs,
        "h_keys": ["Onset and progression of symptoms", "Associated symptoms", "Past medical history", "Medication compliance and allergies"],
        "h_reds": ["Altered mental status", "Severe hemodynamic instability"],
        "e_keys": ["Vital signs", "System-specific examination", "General appearance"],
        "e_reds": ["Hypotension", "Tachycardia", "Hypoxia"],
        "i_keys": ["Targeted blood tests (FBC, UEC, CRP)", "Relevant imaging (X-ray, CT or US)", "Bedside tests (ECG, VBG/ABG, BM)"],
        "i_reds": ["Critical laboratory derangements"],
        "m_keys": ["Immediate resuscitation (ABCDE)", "Specific targeted therapy", "Seniors/Specialist referral", "Supportive care"],
        "m_reds": []
    }
    cases.append(case)

print(f"Generated {len(cases)} cases.")
with open('packages/db/src/data/cases.json', 'w', encoding='utf-8') as f:
    json.dump(cases, f, indent=2, ensure_ascii=False)
