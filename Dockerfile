FROM maven:3.10.0-amazoncorretto-21@sha256:4afe14b2d5f5f9449c3109c6b71ec7585ac31b1f578d057c3cd81354af604ee0 AS build
WORKDIR /app

COPY . .
RUN mvn --batch-mode clean package -s codebuild-mvn-settings.xml -DskipTests

FROM amazoncorretto:21@sha256:e1190de49fc07a399060e58c1d40145ce83ac2d15671405376b8fe0c2694c1fd
WORKDIR /app

COPY --from=build /app/oppijanumerorekisteri-service/target/oppijanumerorekisteri-service-*SNAPSHOT.jar oppijanumerorekisteri.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

echo -n ${vtjkysely_truststore_base64} | base64 --decode > /app/vtjkysely-truststore
echo -n ${vtjkysely_keystore_base64} | base64 --decode > /app/vtjkysely-keystore

exec java \
  -Dlog4j2.formatMsgNoLookups=true \
  -XX:MaxDirectMemorySize=256m \
  -XX:+AlwaysPreTouch \
  -XX:CompressedClassSpaceSize=256m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+UnlockDiagnosticVMOptions \
  -XX:NativeMemoryTracking=summary \
  -XX:+PrintNMTStatistics \
  -XX:InitialRAMPercentage=80.0 \
  -XX:MaxRAMPercentage=80.0 \
  -Dspring.config.additional-location=classpath:/config/oppijanumerorekisteri.yml,classpath:/config/$ENV.yml \
  -Denv.name=$ENV \
  -Dlogging.config=classpath:/config/logback.xml \
  -Dserver.port=8080 \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  -Dnet.bytebuddy.experimental=true \
  -jar \
  oppijanumerorekisteri.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
