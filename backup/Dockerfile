FROM amazonlinux:2023@sha256:eca49f3306c7987da19ddd8da88233837ba055b48d6f08c3e384621b8b9c84f7

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
