FROM maven:3.9.11-amazoncorretto-21-al2023@sha256:bf330f8d3226dc9be432cf33f5311a4a1c2db8d6b128ae840310a6c6ad529e9f AS build
WORKDIR /app

RUN dnf install -y nodejs20 \
  && alternatives --install /usr/bin/node node /usr/bin/node-20 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-20 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-20 90

COPY . .

WORKDIR /app/src/main/static
RUN npm ci
RUN npm run build

WORKDIR /app
RUN mvn --batch-mode clean package -s settings.xml -DskipTests

FROM amazoncorretto:21
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
