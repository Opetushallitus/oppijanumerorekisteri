FROM amazonlinux:2023@sha256:ad882807c6c88f478186fa2632637380e06071a303e2b3bd96ab71846a77c6a3

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
