def blueOceanUrl() {
    return String.format(
        "https://jenkins.tray.io/blue/organizations/jenkins/%s/detail/%s/%s/pipeline",
        env.JOB_NAME, env.JOB_NAME, env.BUILD_NUMBER
    );
}

def authenticateNpm(String npmToken) {
    sh(String.format("npm config set //registry.npmjs.org/:_authToken=%s -q", npmToken))
}

def notifySlackOfPipelineFailure() {
    def command = String.format('curl -H "X-Csrf-Token: %s" -H "Accept: application/json" -H "Content-Type: application/json" -X POST -d \'{"blueOceanLink": "%s"}\' https://1fd9c746-0f12-4a53-a2e5-982e9da8a60e.trayapp.io', env.TRAY_DEV_ACCOUNT_WORKFLOW_UNIVERSAL_CSRF_TOKEN, blueOceanUrl())
    sh command
}

currentBuild.displayName = env.GIT_COMMIT
currentBuild.description = env.GIT_COMMIT

pipeline {
    agent {
        docker {
            image "tray/node:12"
        }
    }

    environment {
        NPM_TOKEN = credentials("NPM_PUBLISH_TOKEN")
        TRAY_DEV_ACCOUNT_WORKFLOW_UNIVERSAL_CSRF_TOKEN = credentials("TRAY_DEV_ACCOUNT_WORKFLOW_UNIVERSAL_CSRF_TOKEN")
        GH_TOKEN = credentials("aef73380-1701-4740-a0ee-a3678c4cf5a4")
        HUSKY_SKIP_INSTALL=1
    }

    stages {
        stage("Install dependencies") {
            steps {
                authenticateNpm(env.NPM_TOKEN)
                sh("rm -rf node_modules && npm ci")
            }
        }

        stage("Build TypeScript") {
            steps {
                sh("npm run build")
            }
        }

        stage("Collect test coverage") {
            steps {
                sh("npm run test:coverage")
            }
        }

        stage("Update test coverage") {
        steps {
                sh("node scripts/updateTestCoverage.js")
            }
        }

        stage("Publish to NPM") {
            steps {
                sshagent(["3d92bed8-6db2-424d-8ebf-881e9f30d587"]) {
                    sh("npm run ciPublish")
                }
            }
        }
    }

    options {
        timeout(time: 7, unit: "MINUTES")
        timestamps()
        ansiColor("xterm")
        disableConcurrentBuilds()
    }
}
