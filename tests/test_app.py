import os
import sys
import pytest

# Dynamically append the parent directory to Python path to avoid import resolution issues
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from questions import QUESTIONS

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_health(client):
    """Test GET /api/health returns 200 and {"status": "ok"}"""
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

def test_get_questions(client):
    """Test GET /api/questions returns a list of 10 questions with correct structure and no leaked answers"""
    response = client.get('/api/questions')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 10
    
    for q in data:
        assert "id" in q
        assert "question" in q
        assert "options" in q
        assert len(q["options"]) == 4
        # Validate that the correct answer key is NOT leaked to the client
        assert "correct_option" not in q
        assert "answer" not in q

def test_post_submit_all_correct(client):
    """Test POST /api/submit with all correct answers returns score = 10"""
    # Construct exact correct answers matching the questions bank
    answers = {}
    for q in QUESTIONS:
        answers[str(q["id"])] = q["correct_option"]
        
    response = client.post('/api/submit', json={"answers": answers})
    assert response.status_code == 200
    data = response.get_json()
    assert data["score"] == 10
    assert "correct_answers" in data
    
    # Check that the backend's correct options report matches the questions bank
    for q in QUESTIONS:
        assert data["correct_answers"][str(q["id"])] == q["correct_option"]

def test_post_submit_empty(client):
    """Test POST /api/submit with empty answers returns score = 0"""
    response = client.post('/api/submit', json={"answers": {}})
    assert response.status_code == 200
    data = response.get_json()
    assert data["score"] == 0
    assert "correct_answers" in data
