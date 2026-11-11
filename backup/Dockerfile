FROM amazonlinux:2027@sha256:f416546ed1949cccde7e976759fe1a4f2d456be1391e6004e117a9d3b55b2afe

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
