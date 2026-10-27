FROM maven:3.10.0-amazoncorretto-21-al2023@sha256:9b868ffa88a46d8b4e605fa14db1e0debe2edb798b3b5890156e92d55a17b11b AS build
WORKDIR /app
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV NVM_DIR=/opt/nvm

COPY .nvmrc /app/.nvmrc
COPY scripts/lib/nvm.sh ${NVM_DIR}/nvm.sh

RUN source "$NVM_DIR/nvm.sh" --no-use \
  && nvm install

COPY henkilo-ui/ .

WORKDIR /app/src/main/static
RUN source "$NVM_DIR/nvm.sh" --no-use \
  && nvm use \
  && npm ci \
  && npm run build

WORKDIR /app
RUN mvn --batch-mode clean package -s codebuild-mvn-settings.xml -DskipTests

FROM amazoncorretto:21.0.12@sha256:d965a0725293a57ea781ba3712d4f024f338aefa249af83b5c1f3981d0e21556
WORKDIR /app

COPY --from=build /app/target/henkiloui.jar henkiloui.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

exec java \
  -Dspring.config.additional-location=classpath:/config/$ENV.yml \
  -jar henkiloui.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
