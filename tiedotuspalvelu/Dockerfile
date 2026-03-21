FROM maven:3.9.14-amazoncorretto-21-al2023@sha256:b44c10a65ca15fb36264057c03cb09a92f1e6e83813a12722f1b9537c1df24a6 AS build

RUN dnf install -y nodejs24 \
  && alternatives --install /usr/bin/node node /usr/bin/node-24 90 \
  && alternatives --install /usr/bin/npm npm /usr/bin/npm-24 90 \
  && alternatives --install /usr/bin/npx npx /usr/bin/npx-24 90

WORKDIR /app
COPY . .

WORKDIR /app/web
RUN npm ci
RUN npx webpack build

WORKDIR /app
RUN mvn --batch-mode clean package -DskipTests

FROM amazoncorretto:21.0.10@sha256:0560910f891ef2d1277539b022de1f6c032d273f0f1e8444f45b7ef8005463c2
WORKDIR /app

COPY --from=build /app/target/tiedotuspalvelu-1.0.0.jar application.jar
COPY --chmod=755 <<"EOF" /app/entrypoint.sh
#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
exec java -jar application.jar
EOF

ENTRYPOINT [ "/app/entrypoint.sh" ]
