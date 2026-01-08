FROM amazon/aws-cli:2.32.31@sha256:a3e339965ff78a9fa20d259dd451508b8bb6bb7005a7d7e7c4b03b28312ab7f1

RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_arm64/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
RUN yum install -y session-manager-plugin.rpm openssh-clients nc jq socat

COPY port-forward.sh .

EXPOSE 1111
HEALTHCHECK --interval=1s --start-period=30s CMD ["nc", "-z", "localhost", "1111"]
ENTRYPOINT ["./port-forward.sh"]
