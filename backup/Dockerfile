FROM amazonlinux:2023@sha256:808df4d068adf02dadb815bdb32bd2b132ce70260571401adf3ff8a19e99ce82

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
