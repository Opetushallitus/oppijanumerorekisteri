FROM amazonlinux:2023@sha256:5af63ef484a9613b3080bb3ae722b6e46b53714360290c5edba71f1af3ac733b

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
