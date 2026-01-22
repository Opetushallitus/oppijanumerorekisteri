FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:0fcea2e46b067616f71dd3c0cd5c8c80f1f3f9570356e74fc311a00cd0b66cd6 AS build

RUN dnf install -y nodejs24 \
  && alternatives --install /usr/bin/node node /usr/bin/node-24 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-24 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-24 90

WORKDIR /app
COPY . .

WORKDIR /app/web
RUN npm ci
RUN npx webpack build

WORKDIR /app
RUN mvn --batch-mode clean package -DskipTests

FROM amazoncorretto:21.0.10@sha256:6e7487368a7b345d24345fcac7f73f4ca6fe75ca74fdeed2e2ef37ae359cda28
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
