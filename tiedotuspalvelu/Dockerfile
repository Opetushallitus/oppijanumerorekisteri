FROM maven:3.9.12-amazoncorretto-21-al2023@sha256:c52f42e16c60e59e28662140676f7dcec610e89d407d275f87f4cc08586a8900 AS build

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
