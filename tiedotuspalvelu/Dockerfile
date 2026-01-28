FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:67c62da6c1f5e59f95ed9e63ce42f3b218d82e9f3f418b57e8bb4af092967521 AS build

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

FROM amazoncorretto:21.0.10@sha256:cfe396cfdec2fa7aeab1cda2c21d1f4f3657fcac4f028f7ca7c011be9e8b2602
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
