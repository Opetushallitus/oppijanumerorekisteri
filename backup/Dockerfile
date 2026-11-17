FROM amazonlinux:2027@sha256:db36765998703b35c91d706cd9325948a20dff258582eb694c56c03c8e44ded7

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
