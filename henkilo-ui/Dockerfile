FROM maven:3.9.14-amazoncorretto-21-al2023@sha256:689681e355bd838f9d9ca77713f71e1a34795f567e10a0a6de908cb678e9833a AS build
WORKDIR /app

RUN dnf install -y nodejs24 \
  && alternatives --install /usr/bin/node node /usr/bin/node-24 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-24 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-24 90

COPY . .

WORKDIR /app/src/main/static
RUN npm ci
RUN npm run build

WORKDIR /app
RUN mvn --batch-mode clean package -s settings.xml -DskipTests

FROM amazoncorretto:21.0.10@sha256:0560910f891ef2d1277539b022de1f6c032d273f0f1e8444f45b7ef8005463c2
WORKDIR /app

COPY --from=build /app/target/henkiloui.jar henkiloui.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

exec java \
  -Dspring.config.additional-location=classpath:/config/$ENV.yml \
  -jar henkiloui.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
