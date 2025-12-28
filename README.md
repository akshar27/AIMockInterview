# MockCode.AI 🤖💻
AI-Powered Mock Interview & Coding Assessment Platform

MockCode.AI is an intelligent interview preparation platform that generates job-specific coding questions, evaluates solutions in real time, and provides AI-driven feedback to help candidates improve their interview performance.

---

## 🚀 Features

- Automated scraping of job descriptions (LinkedIn-style postings)
- LLM-powered generation of role-specific coding questions
- Multi-language code execution using Judge0 API
- AI-driven code review with:
  - Bug detection
  - Optimization suggestions
  - Alternative solutions
- Structured feedback similar to real technical interviews
- Job-to-skill matching and interview readiness assessment

---

## 🧠 System Architecture

- Frontend: React-based coding interface
- Backend: Node.js + Express APIs
- AI Layer:
  - Prompt-chained LLM workflows
  - Context-aware question generation
- Execution Engine:
  - Judge0 API for secure sandboxed execution
- Data Layer:
  - PostgreSQL for jobs, questions, and submissions
- Infrastructure:
  - Dockerized services

