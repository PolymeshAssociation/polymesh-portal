//////////////////////////////////////////////////////////////////////////////////////////

def withSecretEnv(List<Map> varAndPasswordList, Closure closure) {
    wrap([$class: 'MaskPasswordsBuildWrapper', varPasswordPairs: varAndPasswordList]) {
        withEnv(varAndPasswordList.collect { "${it.var}=${it.password}" }) {
            closure()
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////

node {

    properties([[$class: 'BuildDiscarderProperty',
                 strategy: [$class: 'LogRotator',
                            numToKeepStr: '7',
                            daysToKeepStr: '7',
                            artifactNumToKeepStr: '7',
                            artifactDaysToKeepStr: '7']]])

    dir("${JENKINS_HOME}/workspace/${JOB_NAME}/${BUILD_NUMBER}") {

        env.PROJECT_NAME = 'polymesh-portal'

        env.GIT_BRANCH   = env.BRANCH_NAME
        env.VAULT_ADDR   = 'https://127.0.0.1:8200/'
        env.VAULT_CACERT = '/etc/ssl/certs/vault.tls.chain.pem'
        env.GIT_REPO     = "ssh://git@ssh.gitea.polymesh.dev:4444/Deployment/${PROJECT_NAME}.git"

        if (env.CHANGE_BRANCH) {
            env.GIT_BRANCH = env.CHANGE_BRANCH // Job was started from a pull request
        }

        withCredentials([
            usernamePassword(credentialsId: 'vault_approle',
                             usernameVariable: 'VAULT_ROLE_ID',
                             passwordVariable: 'VAULT_SECRET_ID'),
        ]){
            withSecretEnv([[var: 'VAULT_TOKEN',
                            password: sh (returnStdout: true,
                                          label: 'Login To Vault',
                                          script: '''\
                                                  vault write -field=token \
                                                              -format=table \
                                                              auth/approle/login \
                                                              role_id="$VAULT_ROLE_ID" \
                                                              secret_id="$VAULT_SECRET_ID"
                                                  '''.stripIndent()).trim()]]) {
                stage('Clone Repo') {
                    sh (label: 'Clone Repo',
                        script: '''\
                                #!/bin/bash

                                set -eu -o pipefail

                                umask 0077 # mode: 0600

                                cleanup() {
                                    { shred ssh.json; sync; rm -f ssh.json; } || true
                                    { shred id_ed25519; sync; rm -f id_ed25519; } || true
                                    { shred id_ed25519-cert.pub; sync; rm -f id_ed25519-cert.pub; } || true
                                }
                                trap 'excode=$?; cleanup; trap - EXIT; exit $excode' EXIT HUP INT QUIT PIPE TERM

                                printf '{
                                  "key_type": "ed25519",
                                  "key_bits": 0,
                                  "ttl": "1h",
                                  "valid_principals": "jenkins",
                                  "cert_type": "user",
                                  "key_id": "",
                                  "critical_options": {

                                  },
                                  "extensions": {

                                  }
                                }' | vault write -format=json ssh/issue/jenkins - > ssh.json

                                jq -r .data.private_key ssh.json > id_ed25519
                                jq -r .data.signed_key ssh.json > id_ed25519-cert.pub

                                export GIT_SSH_COMMAND=ssh
                                export GIT_SSH_COMMAND+=' -o IdentitiesOnly=yes'
                                export GIT_SSH_COMMAND+=' -o StrictHostKeyChecking=yes'
                                export GIT_SSH_COMMAND+=' -o CertificateFile=id_ed25519-cert.pub'
                                export GIT_SSH_COMMAND+=' -o IdentityFile=id_ed25519'

                                umask 0022 # mode: 0644

                                git clone \
                                    --depth=1 \
                                    --single-branch \
                                    --branch "$GIT_BRANCH" \
                                    "$GIT_REPO"
                                '''.stripIndent())
                }
            }
        }

        dir("${PROJECT_NAME}") {

            env.AWS_ACCOUNT_NUMBER     = env.AWS_ACCOUNT_NUMBER_DATACENTER_PRIMARY
            env.AWS_REGION             = env.AWS_REGION_DATACENTER_PRIMARY
            env.AWS_DEFAULT_REGION     = env.AWS_REGION
            env.CONTAINER_REGISTRY     = "${env.AWS_ACCOUNT_NUMBER}.dkr.ecr.${AWS_REGION}.amazonaws.com"

            env.GIT_COMMIT             = sh (returnStdout: true,
                                             label: 'Read Git Commit',
                                             script: 'git rev-parse HEAD').trim()

            echo "GIT_COMMIT: ${env.GIT_COMMIT}"

            stage('Build') {
                sh (label: 'Build`',
                    script: '''\
                            #!/bin/bash

                            docker build -f Dockerfile -t "${CONTAINER_REGISTRY}/polymesh/portal:${GIT_COMMIT}" .
                            ''')
            }

            stage('Push') {
                sh (label: 'Push',
                    script: '''\
                            #!/bin/bash

                            aws ecr get-login-password | \
                                docker login "$CONTAINER_REGISTRY" --username AWS --password-stdin

                            docker push "${CONTAINER_REGISTRY}/polymesh/portal:${GIT_COMMIT}" || true
                            ''')
            }

        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
