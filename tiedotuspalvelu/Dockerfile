FROM maven:3.9.9-amazoncorretto-21-al2023@sha256:39f77b0b26ef8be4297b3cfdcedc1ed8ff7699fcd5c5181aed26e89ed2d4ef2b AS build

WORKDIR /app
COPY . .
RUN mvn --batch-mode clean package -DskipTests

FROM amazoncorretto:21
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
