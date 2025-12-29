FROM amazon/aws-cli:2.32.25@sha256:281f1ea1f8cfe12c5302c43a1bae13c8613546725d6ebffc7180e6e7f2609f96

RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_arm64/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
RUN yum install -y session-manager-plugin.rpm openssh-clients nc jq socat

COPY port-forward.sh .

EXPOSE 1111
HEALTHCHECK --interval=1s --start-period=30s CMD ["nc", "-z", "localhost", "1111"]
ENTRYPOINT ["./port-forward.sh"]
