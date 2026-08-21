FROM amazonlinux:2023@sha256:181f98c48832fe926f8ca3b6ffeafcce128e96e77b93d08fbe9a9bc9403ce284

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
