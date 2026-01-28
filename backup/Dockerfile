FROM amazonlinux:2023@sha256:2f10659a297494a1842d8b122027e3d865a7d4e5a88c056e53f45316ffc9c985

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
