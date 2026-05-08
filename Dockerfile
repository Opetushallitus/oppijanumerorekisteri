FROM maven:3.9.15-amazoncorretto-21@sha256:f226521a1e1ecd9b0494f7d9090af261e2d358dd65327155098ab5dcd4490473 AS build
WORKDIR /app

COPY . .
RUN mvn --batch-mode clean package -s codebuild-mvn-settings.xml -DskipTests

FROM amazoncorretto:21.0.11@sha256:847bb1001ff27c3c380c35d6a7bb0b8c65280947fffb42a1c900983317cbe5f8
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
  -Xms6g \
  -Xmx6g \
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
