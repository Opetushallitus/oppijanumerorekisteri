FROM amazonlinux:2023@sha256:0a758d7c052738f680b171750249b0e362f5ada84c63d2187870ea3cc63a7fd5

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
