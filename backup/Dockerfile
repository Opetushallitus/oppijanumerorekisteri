FROM amazonlinux:2023@sha256:cfa6c2d0270c6517c0e46cb87aed7edcae8d9eb96af5f51814b6ee8680faaa2c

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
