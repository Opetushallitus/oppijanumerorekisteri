FROM amazonlinux:2023@sha256:82085f72b15db462da227bd8a45c925c72f9d6f25965d22f1c31c47e0a803d80

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
