FROM amazonlinux:2023@sha256:694092ae18877ed4e3cb9b643759ba95df1f12af12528fefa18f60f79d4c1568

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
