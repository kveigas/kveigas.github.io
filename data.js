window.PORTFOLIO_DATA = {
    personal: {
        name: "Kevin Prashant Veigas",
        role: "AI Operations & Project Coordination Professional",
        email: "kveigas825@gmail.com",
        phone: "+1 226-750-6219",
        location: "",
        googleMapsUrl: "",
        linkedin: "https://www.linkedin.com/in/kevinveigas",
        summary: "AI operations and project coordination professional with hands-on experience across the full lifecycle of AI training and evaluation data: building annotation and evaluation pipelines, monitoring production AI systems, running quality calibration processes, and coordinating cross-functional and client-facing delivery. Track record includes owning a 15,000+ item annotation and evaluation pipeline to 99%+ accuracy, cutting issue response time by 35% through proactive drift monitoring, taking process accuracy from 85% to 93% through structured calibration, and cutting QA/rework cycle time by roughly 30%. Holds CAPM (PMI) and Certified ScrumMaster credentials and a Post-Graduate Certificate in IT Project Management (Dean's Honour List)."
    },
    skills: {
        "AI Operations & RLHF": [
            "Pipeline Management",
            "Production System Monitoring",
            "Drift Detection & Root Cause Analysis",
            "Agent/Model Performance Tuning",
            "Rubric-Based Auditing",
            "Adversarial Evaluation"
        ],
        "Quality & Statistics": [
            "Statistical Quality Control (Krippendorff's Alpha, Fleiss' Kappa, Dawid-Skene, MACE)",
            "Inter-Annotator/Inter-Rater Agreement",
            "Calibration Design",
            "Active Learning"
        ],
        "Project & Operations Coordination": [
            "Requirements Gathering",
            "Scope & Timeline Tracking",
            "Status Reporting",
            "Risk & Issue Escalation",
            "Documentation Management",
            "Stakeholder Management"
        ],
        "Tools & Platforms": [
            "Label Studio",
            "Labelbox",
            "Prodigy",
            "Argilla",
            "Encord",
            "Grafana",
            "Jira",
            "Confluence",
            "Excel (Pivot Tables, VLOOKUP, Macros)",
            "SQL",
            "Python (Pandas, NumPy)",
            "Microsoft Office",
            "Agile/Scrum/Kanban"
        ]
    },
    certifications: [
        "CAPM® - Certified Associate in Project Management (PMI)",
        "Certified ScrumMaster® (CSM - Scrum Alliance)",
        "AI Product Management (Duke University)",
        "Deep Learning Specialization (Coursera / Andrew Ng)",
        "Machine Learning (Stanford University)",
        "Managing Machine Learning Projects (Duke University)",
        "Competitive Strategy & Managerial Economics",
        "Excel for Business (Illinois Tech)"
    ],
    companies: [
        {
            name: "Handshake AI",
            role: "AI Training Fellow, Project Seal",
            location: "Remote",
            duration: "2026 – Present",
            description: "Adversarial research and red-teaming evaluation on frontier AI models.",
            achievements: [
                "Designed and tested adversarial research prompts against frontier AI models to expose reasoning failure modes, focusing on information buried in tabular formats (PDFs/images) and conflicting authoritative sources.",
                "Analyzed reasoning breakdowns and documented each failure pattern in structured, evidence-based formats for the research team's evaluation pipeline.",
                "Iterated on prompt design to prioritize novel, high-signal failure modes over repeats of known weaknesses."
            ],
            technologies: ["AI Model Evaluation", "Adversarial Red-Teaming", "RLHF", "Data Adjudication"]
        },
        {
            name: "micro1",
            role: "Business Operations Specialist (AI Training)",
            location: "Remote",
            duration: "June 2026 – Present",
            description: "Complex business workflow capture and AI evaluation across enterprise software environments.",
            achievements: [
                "Constructed and captured complex multi-application business workflows across Microsoft Office 365 (Excel, PowerPoint, Word, Teams, Outlook) for training frontier AI agents.",
                "Evaluated AI-generated outputs against detailed rubrics, verifying active UI states, right-click menus, text highlights, and full-desktop context.",
                "Managed setup and cataloging of dozens of distinct business workflows, ensuring realistic tests of AI agent capabilities.",
                "Audited submission quality, provided clear written feedback, and applied iterative reviewer feedback to enhance consistency."
            ],
            technologies: ["MS Office 365 Workflows", "AI Agent Auditing", "UI State Verification", "Quality Control"]
        },
        {
            name: "Maneva Inc.",
            role: "AI Data Operations Specialist (Contract)",
            location: "Remote, Canada",
            duration: "Aug. 2025 – Oct. 2025",
            description: "Oversaw large-scale AI annotation & evaluation pipeline covering 15,000+ items.",
            achievements: [
                "Oversaw a 15,000+ item pipeline; implemented validation checks and anomaly detection routines that sustained 99%+ accuracy in production.",
                "Led a 15-member operations team, setting up internal performance leaderboards and coaching team members on quality benchmarks.",
                "Facilitated cross-functional calibration sessions and designed structured evaluation rubrics that raised evaluation accuracy from 85% to 93%, cutting QA cycle time by 30%.",
                "Monitored 19 deployed operational systems via real-time Grafana dashboards, preparing daily reports on pipeline health to cut response time by 35%."
            ],
            technologies: ["Grafana", "Krippendorff's Alpha", "Fleiss' Kappa", "Calibration Rubrics", "Python", "SQL"]
        },
        {
            name: "ParallelDots",
            role: "Associate Project Coordinator (AI/ML Operations)",
            location: "Remote",
            duration: "Dec. 2023 – Feb. 2024",
            description: "Coordinated ML delivery and client implementations across 4 client accounts and 3 time zones.",
            achievements: [
                "Coordinated directly with FMCG clients across 4 accounts and 3 time zones to gather requirements, share model outputs, and manage expectations.",
                "Configured AI implementations for shelf-monitoring and product recognition, supporting 90%+ model accuracy.",
                "Tracked requests, decisions, and follow-ups across active accounts using Jira Agile boards and Confluence.",
                "Identified process bottlenecks with ML engineers to streamline model retraining, reducing overall cycle time by 20%."
            ],
            technologies: ["Jira", "Confluence", "Kanban/Scrum", "Client Coordination", "Model Lifecycle"]
        }
    ],
    education: [
        {
            degree: "M.S., AI & Technology Management (Final coursework in progress)",
            school: "Nexford University",
            location: "Online (U.S.-accredited)",
            year: "Present"
        },
        {
            degree: "Post-Graduate Certificate, IT Project Management (Graduated with Distinction, Dean's Honour List)",
            school: "Conestoga College",
            location: "Ontario, Canada",
            year: "Dec 2024"
        },
        {
            degree: "Bachelor of Engineering, Computer Science (First Class)",
            school: "Visvesvaraya Technological University (VTU)",
            location: "India",
            year: "Sep 2023"
        }
    ],
    projects: [
        {
            id: "dataqual-v3",
            title: "DataQual v3.0: Enterprise Annotation Quality & Active Learning Intelligence",
            description: "State-of-the-art AI data annotation quality management platform featuring Active Learning sampling (BADGE/BALD), statistical agreement metrics (Krippendorff's Alpha, Gwet's AC1), Dawid-Skene competence modeling, LLM anchoring bias safeguards, weak supervision (Snorkel paradigm), and live CSV/JSON data ingestion.",
            detailedDescription: "Architected to solve dataset quality degradation, annotator fatigue, and labeling bottlenecks in enterprise AI pipelines. DataQual v3.0 unifies statistical consensus algorithms (Krippendorff's Alpha, Gwet's AC1, MACE), Bayesian competence estimation (Dawid-Skene EM), active learning latent space projections (BADGE/BALD), LLM pre-annotation disposition tracking, and programmatic labeling function IDEs into a dark-mode intelligence suite.",
            tags: ["React 18", "Active Learning (BADGE/BALD)", "Krippendorff's Alpha", "Gwet's AC1", "Dawid-Skene EM", "Snorkel Weak Supervision", "Statistical QC", "Data Ingestion (.CSV/.JSON)"],
            demoUrl: "https://subtle-kashata-db5525.netlify.app",
            featured: true,
            caseStudy: {
                title: "DataQual v3.0 — Enterprise AI Annotation Quality & Active Learning Case Study",
                problem: "Large-scale AI annotation pipelines suffer from undetected annotator drift, guideline ambiguity, class imbalance, and human over-reliance on AI pre-annotations (anchoring bias), leading to costly model retraining cycles.",
                solution: "Engineered DataQual v3.0 — an end-to-end quality intelligence system integrating Active Learning acquisition queues (BADGE/BALD), Bayesian consensus algorithms (Dawid-Skene EM, MACE), LLM anchoring bias monitors, demographic parity audit tables, and weak supervision rules.",
                impact: [
                    "Achieved 3.4x Annotation ROI boost by prioritizing high-uncertainty samples via BADGE active learning.",
                    "Sustained 99%+ production dataset accuracy across 15,000+ item complex evaluation pipelines.",
                    "Eliminated anchoring bias skews by enforcing blind review triggers when AI acceptance exceeded 85%.",
                    "Cut QA rework cycle time by 30% through real-time Krippendorff's Alpha and Gwet's AC1 drift tracking."
                ]
            }
        }
    ]
};
