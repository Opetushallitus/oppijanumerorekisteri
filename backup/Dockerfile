FROM amazonlinux:2023@sha256:c4543691c8ce4157cbfe7d10170106eccb9dedd61f022980f062788d00e8af51

RUN yum update && yum install -y postgresql16 awscli jq

COPY backup.sh /backup.sh

CMD ["/backup.sh"]
