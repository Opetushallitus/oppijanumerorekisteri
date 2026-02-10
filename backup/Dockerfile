FROM amazonlinux:2023@sha256:97073cc66ae1fe66d59315987c36f4eeb98242a85086e972b4109bab4cb57454

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
