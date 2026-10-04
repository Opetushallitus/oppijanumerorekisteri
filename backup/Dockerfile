FROM amazonlinux:2023@sha256:5b29412077a463b4a3a8fbc99a8cdf4b929f38a3ecc8dac10328d8f36b0099b8

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
