FROM amazonlinux:2023@sha256:d09f1353c3c0844852cff7bf103498a205532f5bca444e1ed6406e3c5402bb26

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
