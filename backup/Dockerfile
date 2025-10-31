FROM amazonlinux:2023@sha256:8c22ec81612b78284b5db864e0fad3c8df7688a8fd5baa861d69fe3baf2c7377

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
