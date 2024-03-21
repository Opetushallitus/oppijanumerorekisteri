package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.SlackMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.entity.ContentType;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;

import jakarta.annotation.PostConstruct;

import java.util.Arrays;
import java.util.Optional;

import static org.apache.http.HttpStatus.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlackClientImpl implements SlackClient {
    private final OppijanumerorekisteriProperties properties;
    private OphHttpClient ophHttpClient;
    private final ObjectMapper objectMapper;

    private static final String MESSAGE_HEADER_TEXT = ":wave: Oppijanumerorekisteri notification :wave:";

    @PostConstruct
    public void setup() {
        ophHttpClient = new OphHttpClient.Builder(ConfigEnums.CALLER_ID.value()).build();
    }

    private String sanitize(String message) {
        return message.replaceAll("\\b(\\d{6}[-+A])\\d{3}\\w(\\W|\\b)", "$1****$2");
    }

    private String getSlackMessageJson(String message, String codeBlock) {
        String content = StringUtils.hasLength(codeBlock)
                ? String.format("%s: ```%s```", message, sanitize(codeBlock))
                : message;
        SlackMessage slackMsgDto = new SlackMessage();
        slackMsgDto.setText(MESSAGE_HEADER_TEXT);
        SlackMessage.MessageBlock msgHeader = new SlackMessage.MessageBlock();
        msgHeader.setType(SlackMessage.MessageBlock.Type.header);
        msgHeader.setText(new SlackMessage.MessageBlock.Text(SlackMessage.MessageBlock.Text.Type.plain_text,
                MESSAGE_HEADER_TEXT, true));
        SlackMessage.MessageBlock msgSection = new SlackMessage.MessageBlock();
        msgSection.setType(SlackMessage.MessageBlock.Type.section);
        msgSection.setText(new SlackMessage.MessageBlock.Text(SlackMessage.MessageBlock.Text.Type.mrkdwn, content));
        slackMsgDto.setBlocks(Arrays.asList(msgHeader, msgSection));

        try {
            return objectMapper.writeValueAsString(slackMsgDto);
        } catch (JsonProcessingException jpe) {
            throw new RestClientException("Json processing failure", jpe);
        }
    }

    @Override
    public void sendToSlack(String message, String codeBlock) {
        String content = getSlackMessageJson(message, codeBlock);
        String url = properties.getSlackUrl();
        if (!StringUtils.hasLength(url)) {
            log.warn("Slack integration disabled. Message was: " + content);
            return;
        }

        OphHttpRequest ophHttpRequest = OphHttpRequest.Builder
                .post(url)
                .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .setEntity(new OphHttpEntity.Builder()
                        .content(content)
                        .contentType(ContentType.APPLICATION_JSON)
                        .build())
                .build();
        ophHttpClient.execute(ophHttpRequest)
                .handleErrorStatus(SC_GONE).with(errorMessage -> {
                    log.warn("Could not send Slack notification with error {}", errorMessage);
                    return Optional.empty();
                })
                .expectedStatus(SC_OK, SC_ACCEPTED)
                .ignoreResponse();
    }
}
