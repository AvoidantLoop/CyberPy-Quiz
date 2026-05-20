from flask import Flask, jsonify, request
from flask_cors import CORS
from questions import QUESTIONS

app = Flask(__name__, static_folder='static')
CORS(app)

# Prevent browser caching of static files during development
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/api/questions', methods=['GET'])
def get_questions():
    # Strip correct_option to prevent client-side leaks
    safe_questions = []
    for q in QUESTIONS:
        safe_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"]
        })
    return jsonify(safe_questions)

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.get_json() or {}
    user_answers = data.get("answers", {})
    
    score = 0
    correct_answers = {}
    
    for q in QUESTIONS:
        q_id_str = str(q["id"])
        correct_option = q["correct_option"]
        correct_answers[q_id_str] = correct_option
        
        # Look up key by string or integer mapping
        user_answer = user_answers.get(q_id_str)
        if user_answer is None:
            user_answer = user_answers.get(q["id"])
            
        if user_answer is not None and int(user_answer) == correct_option:
            score += 1
            
    return jsonify({
        "score": score,
        "correct_answers": correct_answers
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
