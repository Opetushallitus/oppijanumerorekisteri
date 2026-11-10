FROM maven:3.10.0-amazoncorretto-21-al2023@sha256:313b3afb28619c7374224b8bb65f9f6cae1dffce3b172e1bd8afe85e4cf05610 AS build
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

FROM amazoncorretto:21.0.13@sha256:90100f194336ef2326f5efe1ee747395fd87d8210ad6d60463196aa0c4b0ad4e
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
