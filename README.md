# 📌 GovDoc Genie

**GovDoc Genie** is an AI-powered government document analysis and compliance assistant.  
The project was initially built for **Agentathon** and has been further refined and structured for a **Google Hackathon**.

It automates document understanding, classification, and key data extraction from government and compliance-related documents such as GST, UDYAM, PAN, quotations, and more.

---

## 👥 Team Information

**Team Name:** HawkAI  
**Team Leader:** Priya  
**Team Member:** Kavin  

---

## 🚀 What GovDoc Genie Does

GovDoc Genie helps users and organizations to:

- Upload multiple government/compliance documents
- Automatically extract structured information
- Identify document types (GST, PAN, UDYAM, Quotation, etc.)
- Generate summaries and insights
- Reduce manual document verification effort

This is useful for:
- Government tender processing
- Compliance verification
- Enterprise document workflows
- AI-assisted document intelligence

---

## 🗂️ Project Structure

google-govdocgenie/
├── documents/ # Sample documents for judge evaluation
│ └── README.md
│
├── backend/ # Backend API & processing logic
│ ├── app.py # Main backend entry point
│ ├── config.py
│ ├── modules/ # Core AI & document parsing logic
│ ├── models/ # AI/ML models
│ ├── templates/ # HTML templates (if applicable)
│ ├── static/ # Static assets
│ ├── uploads/ # Runtime upload directory (ignored in git)
│ ├── training_data/
│ ├── requirements.txt
│ └── Dockerfile
│
├── frontend/ # Frontend UI
│ └── govdoc-ui/ # React application
│
├── README.md # Project overview
└── .gitignore

yaml
Copy code

---

## 🧠 How It Works

1. **Document Upload**  
   Users upload PDFs or images via the frontend UI.

2. **Backend Processing**  
   The backend receives the files and routes them to specialized parsing modules.

3. **AI-Based Extraction**  
   AI logic extracts relevant fields such as IDs, dates, names, and values.

4. **Classification & Insights**  
   Each document is classified and summarized for easy understanding.

5. **Frontend Display**  
   Results are shown in a clean and user-friendly interface.

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Python (Flask / FastAPI style) |
| AI & Parsing | Custom AI modules, OCR, NLP |
| Frontend | React |
| Containerization | Docker |

---

## ⚡ Getting Started (Local Setup)

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
Backend runs on: http://localhost:8000 (or configured port)

Frontend Setup
bash
Copy code
cd frontend/govdoc-ui
npm install
npm run dev
Frontend runs on: http://localhost:3000

📁 Documents for Evaluation (For Judges)
The documents/ folder contains sample government and compliance documents.

Judges can:

Upload these files via the UI

Or use them directly to test backend processing

These documents are non-sensitive samples intended for evaluation and demonstration.

🧪 Example Use Case
Upload:

GST Certificate

PAN Card

UDYAM Certificate

Quotation PDF

GovDoc Genie:

Detects document types

Extracts key data

Displays structured summaries

User reviews results instantly

🔐 Notes
.env files are not committed to the repository

backend/uploads/ is runtime-only and ignored from version control

Sample documents are provided only for demonstration

🏁 Conclusion
GovDoc Genie demonstrates how AI can simplify complex government and compliance document workflows by making them faster, smarter, and more reliable.

Built by HawkAI
Team Leader: Priya
Team Member: Kavin


