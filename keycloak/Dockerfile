FROM quay.io/keycloak/keycloak:26.5.7@sha256:45ae20191531eb608ddb0b775d012b40d3e4f942697f3214694887dd7c108d13

ADD --chmod=644 \
  --checksum=sha256:54d3f82b90caf4f7ca630957eda8d70524d7140cb510e9939a962bcee545655c \
https://github.com/jacekkow/keycloak-protocol-cas/releases/download/26.5.5/keycloak-protocol-cas-26.5.5.jar \
  /opt/keycloak/providers/keycloak-protocol-cas-26.5.5.jar
