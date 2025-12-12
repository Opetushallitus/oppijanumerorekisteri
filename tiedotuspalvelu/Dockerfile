FROM maven:3.9.11-amazoncorretto-21-al2023@sha256:b0e00d2581674e0c12392bb88075a2835e73af86af48bbdb8eeec3d2e993ea40 AS build

WORKDIR /app
COPY . .
RUN mvn --batch-mode clean package -DskipTests

FROM amazoncorretto:21.0.9@sha256:c26e10ed8cf8300aacc0952a4869ed64e14d47d2cfdb24235b891233e4c5385c
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
