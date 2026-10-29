FROM maven:3.10.0-amazoncorretto-21@sha256:be93cfd9103cf111289f4725d1fb08dfd6f31d77b77da338f87aa470642e8ce5 AS build
WORKDIR /app

COPY . .
RUN mvn --batch-mode clean package -s codebuild-mvn-settings.xml -DskipTests

FROM amazoncorretto:21.0.13@sha256:1a307926702559b0086a5c4d339eaafa9c992b3e8ba54201ac8ebbde31d22f0b
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
