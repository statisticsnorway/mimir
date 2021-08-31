pipeline {
  agent {
    docker {
      image 'enonic/enonic-ci:7.4-node'
    }
  }
  environment {
    ENONIC_CLI_REMOTE_URL  = credentials('jenkins-enonic-url-utv')
    ENONIC_CLI_REMOTE_USER = credentials('jenkins-enonic-user-utv')
    ENONIC_CLI_REMOTE_PASS = credentials('jenkins-enonic-pass-utv')
  }
  stages {
    stage('Build and Test App') {
      steps {
        sh '/setup_sandbox.sh'
        sh 'enonic project build'
      }
    }
    stage('Deploy App') {
      steps {
        sh 'enonic app install --file build/libs/*.jar'
      }
    }
  }
}
