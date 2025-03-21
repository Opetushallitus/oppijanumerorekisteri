FROM maven:3.9.8-amazoncorretto-21-al2023@sha256:047632648d979f72b5816eff24625149ed9c5b80caf63e3415392890dc379e73 AS build
WORKDIR /app

RUN dnf install -y nodejs20 \
  && alternatives --install /usr/bin/node node /usr/bin/node-20 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-20 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-20 90

COPY . .

WORKDIR /app/src/main/static
RUN npm ci
RUN npm run build

WORKDIR /app
RUN mvn clean package -s settings.xml -DskipTests

FROM amazoncorretto:21@sha256:c0643148d077b3917bf6c085aaa1ac35ff1f202344ab8691cc0f5953f9b97f8e
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
