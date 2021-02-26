def authenticateOnNpm() {
    sh String.format('npm config set "//registry.npmjs.org/:_authToken=%s"', env.NPM_TOKEN)
}

currentBuild.displayName = String.format(
    'PR %s',
    params.ghprbPullId,
);
currentBuild.description = env.GIT_COMMIT;

pipeline {
    agent {
        docker {
            image "tray/node:12"
        }
    }

    environment {
        NPM_TOKEN = credentials("NPM_TOKEN_READ_ONLY")
    }

    stages {
        stage("Install dependencies") {
            steps {
                authenticateOnNpm()
                sh("rm -rf node_modules/ && npm ci")
            }
        }

        stage("Build TypeScript") {
            steps {
                sh("npm run build")
            }
        }

        stage("Lint") {
            steps {
                sh("npm run lint")
            }
        }

        stage("Tests") {
            steps {
                sh("npm test")
            }
        }
    }

    options {
        timeout(time: 4, unit: "MINUTES")
        timestamps()
        ansiColor("xterm")
    }
}
