FROM amazonlinux:2023@sha256:0c74e9fbba754003cfa179fd5cc65be7790d7248443276948704b8a858b298e5

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
