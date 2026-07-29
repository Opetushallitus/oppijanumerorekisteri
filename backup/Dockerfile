FROM amazonlinux:2023@sha256:c4b0d324eaacbc5805ab5f147ba71963184752da90340bf0803c1034a170c8d1

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
