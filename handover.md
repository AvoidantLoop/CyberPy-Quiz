# CyberPy Quiz — Project Handover Document

**Project Name:** CyberPy Quiz  
**Date of Handover:** 20 May 2026  
**Technology Stack:** Python · Flask · Vanilla HTML/CSS/JS · Docker · Jenkins  
**Application URL (local):** http://localhost:5000  

---

## 1. Project Overview

CyberPy Quiz is a full-stack, single-page web application that presents a timed, 10-question Python knowledge assessment to a named candidate. The app is styled with a cyberpunk/dark-glassmorphism aesthetic and is designed to be deployed as a containerised service.

### Key Features

| Feature | Details |
|---|---|
| Candidate name entry | Input validation, Enter-key support, error feedback |
| 10 Python MCQs | Advanced topics: MRO, closures, GIL, descriptors, metaclasses, etc. |
| Answer security | `correct_option` is never sent to the client; grading happens server-side |
| Animated progress | Gradient progress bar that fills as questions advance |
| Results page | Animated radial score gauge, personalised feedback message |
| Performance breakdown | Per-question review cards showing correct vs. user answer |
| Retake support | Full state reset without page reload |
| Health check endpoint | `/api/health` used by Docker healthcheck |
| Containerised deployment | Docker + Docker Compose, ready for CI/CD |
| Automated CI/CD | Jenkins pipeline (5 stages) |
| Test suite | 4 pytest tests covering all API routes |

---

## 2. Repository Structure

```
quiz-app/
├── app.py                  # Flask application — routes & API logic
├── questions.py            # Question bank (10 Python MCQs with answers)
├── requirements.txt        # Python dependencies (flask, flask-cors, pytest)
├── Dockerfile              # Container image definition (python:3.11-slim)
├── docker-compose.yml      # Service orchestration + healthcheck
├── Jenkinsfile             # CI/CD pipeline (5 stages)
├── .gitignore              # Standard Python ignores
├── static/
│   ├── index.html          # Single-page app shell (3 view sections)
│   ├── style.css           # Full design system (~805 lines, dark theme)
│   └── script.js           # All frontend logic (~334 lines, vanilla JS)
└── tests/
    └── test_app.py         # Pytest test suite (4 test cases)
```

---

## 3. Architecture

```
Browser (SPA)
    │
    │  GET  /                    → serves static/index.html
    │  GET  /static/style.css    → served by Flask static handler
    │  GET  /static/script.js    → served by Flask static handler
    │
    │  GET  /api/questions       → returns 10 Qs (NO correct_option)
    │  POST /api/submit          → receives answers dict, returns score + correct_answers
    │  GET  /api/health          → returns {"status": "ok"}
    │
Flask Backend (app.py)
    │
    └── questions.py  ←  single source of truth for Q&A data
```

The app is a **monolith**: the Flask server both serves the static frontend files and provides the JSON API. There is no separate frontend build step or external database — all questions are stored in `questions.py`.

---

## 4. API Reference

### `GET /api/health`
Returns service liveness status.

**Response `200 OK`:**
```json
{ "status": "ok" }
```

---

### `GET /api/questions`
Returns all 10 questions without leaking the correct answers.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"]
  },
  ...
]
```

> **Security note:** `correct_option` is intentionally stripped in `app.py` before the response is sent.

---

### `POST /api/submit`
Accepts the candidate's answers and returns the score.

**Request body:**
```json
{
  "answers": {
    "1": 0,
    "2": 1,
    ...
  }
}
```
Keys are question IDs (as strings), values are the 0-indexed option chosen.

**Response `200 OK`:**
```json
{
  "score": 8,
  "correct_answers": {
    "1": 0,
    "2": 1,
    ...
  }
}
```

---

## 5. Question Bank

Located in [`questions.py`](./questions.py). Contains 10 expert-level Python MCQs on:

| # | Topic |
|---|---|
| 1 | C3 Linearization / Method Resolution Order (MRO) |
| 2 | Late-binding closures in list comprehensions |
| 3 | Mutable default argument pitfall |
| 4 | Metaclass `__new__` vs `__init__` |
| 5 | CPython integer interning (small int cache) |
| 6 | Data vs non-data descriptor lookup precedence |
| 7 | `yield from` and delegating generators |
| 8 | Global Interpreter Lock (GIL) and CPU-bound threads |
| 9 | Decorator stacking evaluation order |
| 10 | `__missing__` in dict subclasses |

Each entry in `QUESTIONS` has the shape:
```python
{
    "id": int,
    "question": str,
    "options": List[str],      # exactly 4 options
    "correct_option": int      # 0-indexed
}
```

---

## 6. Frontend Design System

The UI is built with **plain HTML, CSS, and JavaScript** — no framework or build tool is required.

### Design Tokens (`style.css`)

| Token | Value | Usage |
|---|---|---|
| `--bg-dark` | `#080b11` | Page background |
| `--card-bg` | `rgba(17,24,39,0.7)` | Glassmorphism cards |
| `--primary-grad` | `#00f2fe → #4facfe` | Buttons, progress bar, text highlights |
| `--success` | `#10b981` | Correct answer cards |
| `--error` | `#f43f5e` | Incorrect answer cards / input errors |
| `--font-family` | Plus Jakarta Sans | Google Fonts |

### Views (SPA State Machine)

The single `index.html` contains three `<section>` elements. JavaScript toggles the `.active` class to show/hide them:

```
landing-view  ──[Start]──►  quiz-view  ──[Submit]──►  results-view
     ▲                                                      │
     └──────────────────────[Retake]───────────────────────┘
```

### JavaScript Logic (`script.js`)

| Function | Responsibility |
|---|---|
| `handleStartQuiz()` | Validates name, calls `fetchQuestions()`, transitions to quiz view |
| `fetchQuestions()` | `GET /api/questions`, stores in `questions[]` |
| `renderQuestion()` | Renders current question + options, updates progress bar |
| `selectOption()` | Records answer in `userAnswers{}`, enables Next button |
| `nextBtn` click handler | Advances question or submits via `POST /api/submit` |
| `displayResults()` | Populates score gauge, feedback text, and per-question review cards |
| `restartBtn` click handler | Resets all state variables, transitions to landing view |
| `transitionView()` | Handles CSS animation between views (150 ms delay) |
| `escapeHTML()` | XSS-safe rendering of user-supplied and question text |

---

## 7. Running the Application

### Option A — Local (Python)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the Flask development server
python app.py
```

App available at: **http://localhost:5000**

### Option B — Docker (Recommended)

```bash
# Build and start the container
docker-compose up -d

# Verify it is running
docker-compose ps

# Check logs
docker-compose logs -f quiz-app

# Stop the container
docker-compose down
```

The container automatically restarts (`restart: always`) and exposes port **5000**.

### Docker Healthcheck

Docker Compose runs a healthcheck every 30 seconds:
```
curl -f http://localhost:5000/api/health
```
Timeout: 10 s | Retries: 3

---

## 8. Running Tests

```bash
# From the quiz-app/ directory
pytest tests/ -v
```

### Test Coverage

| Test | Route | Assertion |
|---|---|---|
| `test_get_health` | `GET /api/health` | Status 200, `{"status":"ok"}` |
| `test_get_questions` | `GET /api/questions` | 10 items, correct structure, `correct_option` NOT present |
| `test_post_submit_all_correct` | `POST /api/submit` | Score = 10 for all-correct answers |
| `test_post_submit_empty` | `POST /api/submit` | Score = 0 for empty answers dict |

---

## 9. CI/CD Pipeline (Jenkins)

The [`Jenkinsfile`](./Jenkinsfile) defines a declarative pipeline with **5 sequential stages**:

```
Clone → Install Dependencies → Run Tests → Build Docker Image → Deploy Container
```

| Stage | Command |
|---|---|
| Clone | `checkout scm` |
| Install Dependencies | `pip install -r requirements.txt` |
| Run Tests | `pytest tests/ -v` |
| Build Docker Image | `docker build -t quiz-app:latest .` |
| Deploy Container | `docker-compose down \|\| true` → `docker-compose up -d` |

**Post-actions:**
- `success` → prints `"Deployment successful!"`
- `failure` → prints `"Pipeline failed. Check logs."`

> **Prerequisite:** The Jenkins agent must have Python 3, pip, Docker, and Docker Compose installed.

---

## 10. Dependencies

**Python (`requirements.txt`):**

| Package | Purpose |
|---|---|
| `flask` | Web framework and static file serving |
| `flask-cors` | CORS headers (permits cross-origin requests during dev) |
| `pytest` | Test runner |

**Frontend (CDN — no install required):**

| Library | Version | Purpose |
|---|---|---|
| Plus Jakarta Sans | — | Google Fonts (typography) |
| Font Awesome | 6.4.0 | Icons (Python logo, arrows, check/cross marks) |

---

## 11. Docker Configuration

### `Dockerfile`

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

Base image: `python:3.11-slim` (lightweight, production-appropriate).

### `docker-compose.yml`

- Service name: `quiz-app`
- Host port → Container port: `5000:5000`
- Restart policy: `always`
- Healthcheck: `curl -f http://localhost:5000/api/health`

---

## 12. Known Limitations & Future Improvements

| Area | Current State | Suggested Improvement |
|---|---|---|
| Question bank | Hard-coded in `questions.py` | Move to a database (SQLite / PostgreSQL) for dynamic CRUD |
| Authentication | None | Add JWT-based auth if tracking individual results |
| Scoring persistence | In-memory only (per request) | Store results in a DB or export to CSV |
| Timer | Not implemented | Add a per-question or total countdown timer |
| Question randomisation | Fixed order | Shuffle questions and options per session |
| HTTPS | Not configured | Terminate TLS at a reverse proxy (Nginx) in production |
| Cache headers | All responses set `no-store` | Fine-tune for production; static assets should be cached |
| CORS policy | Open (`*`) via flask-cors | Lock down `ALLOWED_ORIGINS` for production |
| Jenkins agent | Assumes global Python/Docker install | Use Docker agent or virtualenv in pipeline |

---

## 13. File Quick Reference

| File | Lines | Role |
|---|---|---|
| [`app.py`](./app.py) | 64 | Flask app, all API routes |
| [`questions.py`](./questions.py) | 113 | Question bank (single source of truth) |
| [`requirements.txt`](./requirements.txt) | 3 | Python dependencies |
| [`Dockerfile`](./Dockerfile) | 7 | Container image build instructions |
| [`docker-compose.yml`](./docker-compose.yml) | 13 | Service orchestration |
| [`Jenkinsfile`](./Jenkinsfile) | 28 | CI/CD pipeline definition |
| [`static/index.html`](./static/index.html) | 138 | SPA shell (3 views) |
| [`static/style.css`](./static/style.css) | 805 | Full design system |
| [`static/script.js`](./static/script.js) | 334 | All frontend logic |
| [`tests/test_app.py`](./tests/test_app.py) | 64 | Pytest test suite (4 tests) |

---

*Document prepared for project handover — CyberPy Quiz, May 2026.*
