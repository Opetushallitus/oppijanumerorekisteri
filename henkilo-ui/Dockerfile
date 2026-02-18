FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:27b9bd8052a0a8e2103b704f79876826baeea30ec27e73467ee8952c2656b7d4 AS build
WORKDIR /app

RUN dnf install -y nodejs24 \
  && alternatives --install /usr/bin/node node /usr/bin/node-24 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-24 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-24 90

COPY . .

WORKDIR /app/src/main/static
RUN npm ci
RUN npm run build

WORKDIR /app
RUN mvn --batch-mode clean package -s settings.xml -DskipTests

FROM amazoncorretto:21.0.10@sha256:cbae4fac2af2df50b411c532f5a7af9ce56f00768298854a24c76057c6817106
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
