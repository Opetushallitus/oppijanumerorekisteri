FROM maven:3.9.11-amazoncorretto-21@sha256:82d98fbed447e3f7dfbf1089840a51bfaeb5651cb47a9c5820139d054db3dde1 AS build
WORKDIR /app

COPY . .
RUN mvn --batch-mode clean package -s settings.xml -DskipTests

FROM amazoncorretto:21.0.9@sha256:c26e10ed8cf8300aacc0952a4869ed64e14d47d2cfdb24235b891233e4c5385c
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
