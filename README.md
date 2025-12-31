# GovDoc Genie
AI-Powered Government Document Intelligence Platform

[![GitHub stars](https://img.shields.io/github/stars/k-a-v-i-n-0-0-2/google-govdocgenie?style=for-the-badge)](https://github.com/k-a-v-i-n-0-0-2/google-govdocgenie/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/k-a-v-i-n-0-0-2/google-govdocgenie?style=for-the-badge)](https://github.com/k-a-v-i-n-0-0-2/google-govdocgenie/network)
[![GitHub issues](https://img.shields.io/github/issues/k-a-v-i-n-0-0-2/google-govdocgenie?style=for-the-badge)](https://github.com/k-a-v-i-n-0-0-2/google-govdocgenie/issues)

---

## Overview

**GovDoc Genie** is an AI-driven document intelligence system designed to automate the analysis, classification, and information extraction from government and compliance-related documents.

Originally developed for **Agentathon** and refined for a **Google Hackathon**, GovDoc Genie reduces manual effort and increases accuracy in tender processing, compliance verification, and other document-heavy workflows.

---

## Team

- Team Name: **HawkAI**  
- Team Leader: **Priya**  
- Team Member: **Kavin**

---

## Problem Statement

Government and enterprise workflows often require processing multiple compliance documents such as:

- GST certificates  
- PAN cards  
- UDYAM registrations  
- Quotations and tender-related documents  

These documents tend to be unstructured or semi-structured, are time-consuming to verify manually, and are prone to human error. Existing systems often lack intelligent automation to understand, classify, and extract meaningful insights from these documents.

---

## Solution

GovDoc Genie provides a unified, AI-powered solution that:

- Accepts multiple government and compliance documents
- Automatically identifies document types
- Extracts structured and relevant information
- Presents insights through a clean and intuitive UI
- Enables faster, more reliable decision-making

---

## Key Features

- Multi-document upload support  
- Automatic document classification  
- OCR-based text extraction and parsing  
- Domain-aware field extraction (GST, PAN, UDYAM, quotations, etc.)  
- Structured data generation from unstructured inputs  
- User-friendly frontend interface  
- Scalable and modular backend architecture  
- Dockerized for easy deployment

---

## System Architecture

The system follows a modular architecture:

1. Frontend Layer
   - React-based UI for document upload, preview, and result visualization.

2. Backend API Layer
   - Python-based API (Flask/FastAPI style) that handles uploads, routes processing, and serves results.

3. AI & Processing Layer
   - OCR for text extraction (Tesseract, cloud OCR or similar)
   - Document classification model
   - NLP and custom parsing for domain-specific field extraction

4. Storage Layer
   - Temporary runtime storage for uploads
   - Repository-level `documents/` folder with sample documents for evaluation

---

## Project Structure

```
google-govdocgenie/
├── documents/     # Sample documents for judge evaluation
├── backend/       # Backend API and AI processing
├── frontend/      # Frontend user interface (e.g., frontend/govdoc-ui)
├── docker/        # Dockerfiles & docker-compose (optional)
└── README.md
```

---

## Technology Stack

- Backend: Python (Flask or FastAPI), modular services  
- AI & Processing: OCR, custom parsing logic, NLP-based field identification  
- Frontend: React (component-based UI)  
- DevOps: Docker, Docker Compose, GitHub

---

## Setup Instructions

Below are general instructions — adapt commands to your environment and the actual project scripts.

### Backend (local)

Unix / macOS:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# If using Flask
python app.py

# If using FastAPI + uvicorn
# python -m uvicorn app:app --reload
```

Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The backend will run on the configured port (see backend/.env or app config).

### Frontend (local)

```bash
cd frontend/govdoc-ui
npm install
npm run dev   # or npm start depending on the project
```

The frontend typically runs on `http://localhost:3000` or the port shown in the console.

### Docker (recommended for evaluation)

From repository root:
```bash
# Ensure .env files are created for backend/frontend as required
docker-compose up --build
```
Services will be available at the configured ports.

---

## Documents for Evaluation (Judges)

The `documents/` directory contains sample, non-sensitive documents intended for evaluation and testing. Judges can:

- Upload these documents via the frontend UI
- Use them to test backend processing pipelines

The folder is placed at the root level for quick access during evaluation.

---

## Example Workflow

1. User uploads multiple documents (e.g., GST, PAN, UDYAM, quotation).  
2. The system:
   - Detects each document type
   - Extracts relevant fields (name, registration numbers, dates, amounts, etc.)
   - Classifies documents and generates structured output
3. Results are displayed in a readable table/layout for quick review.

---

## Security & Best Practices

- `.env` files are excluded from version control (add `.env` to `.gitignore`)
- Runtime uploads should be ignored by Git
- Sample documents must not contain sensitive or real personal data
- Keep API keys and secrets out of the repository (use secret managers in production)

---

## Scalability & Future Enhancements

Potential improvements:

- Cloud storage integrations (GCS, S3) for persistent storage  
- Add more document types and domain-specific extractors  
- Advanced compliance rule engine and automated validations  
- Role-based access control (RBAC) and audit logging  
- Analytics and reporting dashboards for processed documents

---

## Contribution

Contributions are welcome. Please follow the standard GitHub workflow:

1. Fork the repository  
2. Create a feature branch (e.g., `feature/add-new-doc-type`)  
3. Commit changes and open a PR with a clear description of the changes and rationale

Provide a `CONTRIBUTING.md` for detailed contribution guidelines if desired.

---

## License

Add an appropriate license (e.g., MIT, Apache-2.0). This README references a LICENSE file; please add one to the repository.

---

## Contact & Credits

Built by Team HawkAI  
- Team Leader: Priya  
- Team Member: Kavin

For questions, feature requests, or contributions open an issue on GitHub.

---

## Conclusion

GovDoc Genie demonstrates how AI can be applied to real-world government and enterprise document workflows to reduce manual effort, increase throughput, and improve accuracy. This README is intended to make it easy for judges, contributors, and evaluators to run and test the project quickly.
