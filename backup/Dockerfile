FROM amazonlinux:2023@sha256:f590f33787c76bee9c42cc6826ee887bc1f3b60ba5ed137af450a6c0a79cdb57

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
