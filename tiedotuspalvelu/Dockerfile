FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:da06d57ff9202aee9bf58f6e464733cfe06b356d1c726c8ab904971656895e16 AS build

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
