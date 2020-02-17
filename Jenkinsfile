pipeline {
  agent {
    docker {
      image 'enonic/enonic-ci:7.2-node'
    }
  }
  environment {
    ENONIC_CLI_REMOTE_URL  = credentials('jenkins-enonic-url-utv')
    ENONIC_CLI_REMOTE_USER = credentials('jenkins-enonic-user-utv')
    ENONIC_CLI_REMOTE_PASS = credentials('jenkins-enonic-pass-utv')
    HOME = '.'
  }
  stages {
    stage('Build and Test App') {
      steps {
        sh '/setup_sandbox.sh'
        sh 'enonic project build'
        sh 'echo DEBUG UID:$UID CONTAINER_ID:$HOSTNAME HOME_DIR:$HOME ENONIC_FILES:\"$(ls $HOME/.enonic)\"'
      }
    }
    stage('Deploy App') {
      steps {
        sh 'echo DEBUG UID:$UID CONTAINER_ID:$HOSTNAME HOME_DIR:$HOME ENONIC_FILES:\"$(ls $HOME/.enonic)\"'
        sh 'enonic app install --file build/libs/*.jar'
      }
    }
  }
}
