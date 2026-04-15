package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.SlackClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.OppijanumerorekisteriProperties;
import fi.vm.sade.oppijanumerorekisteri.dto.SlackMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlackClientImpl implements SlackClient {
    private final OppijanumerorekisteriProperties properties;
    private final ObjectMapper objectMapper;

    private static final String MESSAGE_HEADER_TEXT = ":wave: Oppijanumerorekisteri notification :wave:";

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

        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(BodyPublishers.ofString(content))
                .build();
        var client = HttpClient.newHttpClient();
        try {
            HttpResponse<String> res = client.send(request, BodyHandlers.ofString());
            if (res.statusCode() != 200 || res.statusCode() != 202) {
                throw new RuntimeException("Failed to send to slack with status " + res.statusCode() + ": " + res.body());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }
}
