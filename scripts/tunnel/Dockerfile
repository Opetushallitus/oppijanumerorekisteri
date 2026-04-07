FROM amazon/aws-cli:2.34.25@sha256:3810b288da2dfde82de6d46b136c7f5d4a16fef01fc2135e0c8ec9e52c9d7ebb

RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_arm64/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
RUN yum install -y session-manager-plugin.rpm openssh-clients nc jq socat

COPY port-forward.sh .

EXPOSE 1111
HEALTHCHECK --interval=1s --start-period=30s CMD ["nc", "-z", "localhost", "1111"]
ENTRYPOINT ["./port-forward.sh"]
