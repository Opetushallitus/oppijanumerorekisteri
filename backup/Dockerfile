FROM amazonlinux:2027@sha256:a3f3bd43b9ca54852d1b3073addcc3164ba57c4ef99a789c79f471313336134e

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
