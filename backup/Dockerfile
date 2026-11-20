FROM amazonlinux:2027@sha256:abc7f248875304452b85e4f2be47bb30cd7790fccf7f68c3a9554019346be8c3

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
