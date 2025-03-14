FROM amazonlinux:2023@sha256:97bee6ea9b724a96fc90f8a5a8738ec6d8a7c94a6b5a502dfed0461170b98137

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
