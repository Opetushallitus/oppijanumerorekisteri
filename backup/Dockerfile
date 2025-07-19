FROM amazonlinux:2023@sha256:472957840eacc161151bea727e9b7db4ca0c4fc857e870a9218e97f5c46b34e6

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
