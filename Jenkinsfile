pipeline {
  agent {
    docker {
      image 'enonic/enonic-ci:7.2-node'
      args '--entrypoint='
    }
  }
  environment {
    ENONIC_CLI_REMOTE_URL  = credentials('jenkins-enonic-url-utv')
    ENONIC_CLI_REMOTE_USER = credentials('jenkins-enonic-user-utv')
    ENONIC_CLI_REMOTE_PASS = credentials('jenkins-enonic-pass-utv')
    HOME='/tmp/home'
  }
  stages {
    stage('Build and Test App') {
      steps {
        sh 'mkdir -p $HOME'
        sh '/setup_sandbox.sh'
        sh 'echo DEBUG ID:\"$(id)\" CONTAINER_ID:$HOSTNAME HOME_DIR:$HOME HOME_FILES:\"$(ls -a $HOME)\" ENONIC_FILES:\"$(ls $HOME/.enonic)\"'
        sh 'enonic project build'
      }
    }
    stage('Deploy App') {
      steps {
        sh 'echo DEBUG ID:\"$(id)\" CONTAINER_ID:$HOSTNAME HOME_DIR:$HOME HOME_FILES:\"$(ls -a $HOME)\" ENONIC_FILES:\"$(ls $HOME/.enonic)\"'
        sh 'curl -X POST -f -s -S -o - -u $ENONIC_CLI_REMOTE_USER:$ENONIC_CLI_REMOTE_PASS -F \"file=@$(find build/libs/ -name *.jar)\" $ENONIC_CLI_REMOTE_URL/app/install | xargs echo'
      }
    }
  }
}
