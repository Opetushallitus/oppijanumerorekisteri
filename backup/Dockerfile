FROM amazonlinux:2023@sha256:26c694baf098de77aaad6b19504e3c0709093627951a3ffbe00a72abe500eb68

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
