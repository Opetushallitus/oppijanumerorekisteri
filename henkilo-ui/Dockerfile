FROM maven:3.10.0-amazoncorretto-21-al2023@sha256:acc191eb1b0b8cc3fe9b88ae662a0ce7e15f6dd09e4b998a7b9c1a16e517ceaa AS build
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

FROM amazoncorretto:21.0.13@sha256:3f2da8fd79b0a7275506eb5a828a62dae7eaa984a6a1b0542a897a85cf74baa7
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
