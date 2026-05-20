pipeline {
  agent any
  stages {
    stage('Clone') {
      steps { checkout scm }
    }
    stage('Install Dependencies') {
      steps { sh 'pip install -r requirements.txt' }
    }
    stage('Run Tests') {
      steps { sh 'pytest tests/ -v' }
    }
    stage('Build Docker Image') {
      steps { sh 'docker build -t quiz-app:latest .' }
    }
    stage('Deploy Container') {
      steps {
        sh 'docker-compose down || true'
        sh 'docker-compose up -d'
      }
    }
  }
  post {
    success { echo 'Deployment successful!' }
    failure { echo 'Pipeline failed. Check logs.' }
  }
}
