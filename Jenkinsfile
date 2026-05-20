pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/AvoidantLoop/CyberPy-Quiz.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'pip install -r requirements.txt'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'pytest tests/ -v'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t quiz-app:latest .'
            }
        }

        stage('Deploy Container') {
            steps {
                bat 'docker-compose down'
                bat 'docker-compose up -d'
            }
        }
    }

    post {
        success { echo 'Deployment successful!' }
        failure { echo 'Pipeline failed. Check logs.' }
    }
}