FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:0fcea2e46b067616f71dd3c0cd5c8c80f1f3f9570356e74fc311a00cd0b66cd6 AS build

WORKDIR /app
COPY . .
RUN mvn --batch-mode clean package -DskipTests

FROM amazoncorretto:21.0.9@sha256:3664f91eacdcc0e5e804b9cd830ccbe57c1c2773c1e67096872d46901b45230f
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
