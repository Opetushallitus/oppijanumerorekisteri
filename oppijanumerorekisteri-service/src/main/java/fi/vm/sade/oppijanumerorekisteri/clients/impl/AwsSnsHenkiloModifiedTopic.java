package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.amazonaws.services.sns.AmazonSNS;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.clients.HenkiloModifiedTopic;
import fi.vm.sade.oppijanumerorekisteri.configurations.AwsConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class AwsSnsHenkiloModifiedTopic implements HenkiloModifiedTopic {
    private static final Logger LOGGER = LoggerFactory.getLogger(AwsSnsHenkiloModifiedTopic.class);

    private AmazonSNS client;
    private ObjectMapper objectMapper;
    private String topicArn;
    private boolean enabled;

    @Autowired
    public AwsSnsHenkiloModifiedTopic(AwsConfiguration configuration, AmazonSNS client, ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
        this.topicArn = configuration.getHenkiloModifiedTopic().getTopicArn();
        this.enabled = configuration.getHenkiloModifiedTopic().isEnabled();
        if (enabled) {
            LOGGER.info(String.format("AwsSnsHenkiloModifiedTopic of ARN %s", this.topicArn));
        } else {
            LOGGER.warn("AwsSnsHenkiloModifiedTopic disabled");
        }
    }

    @Override
    public void publish(Henkilo henkilo) {
        if (enabled) {
            Map<String, String> m = new HashMap<>();
            m.put("oidHenkilo", henkilo.getOidHenkilo());
            try {
                this.client.publish(this.topicArn, this.objectMapper.writeValueAsString(m));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
