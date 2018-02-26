package fi.vm.sade.henkiloui.service.impl;

import fi.vm.sade.henkiloui.client.LokalisointiClient;
import fi.vm.sade.henkiloui.configurations.ExposedResourceMessageBundleSource;
import fi.vm.sade.henkiloui.dto.LokalisointiDto;
import static java.util.Arrays.asList;
import java.util.Collection;
import java.util.Properties;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import static org.mockito.Matchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.env.Environment;

@RunWith(MockitoJUnitRunner.class)
public class LocalizationServiceImplTest {

    private LocalizationServiceImpl localizationServiceImpl;

    @Mock
    private ExposedResourceMessageBundleSource messageSource;
    @Mock
    private LokalisointiClient lokalisointiClient;
    @Mock
    private Environment environment;
    @Captor
    private ArgumentCaptor<Collection<LokalisointiDto>> lokalisointiDtoCollectionCaptor;

    @Before
    public void setup() {
        localizationServiceImpl = new LocalizationServiceImpl(messageSource, lokalisointiClient, environment);
    }

    @Test
    public void synchronize() {
        when(lokalisointiClient.list(any())).thenReturn(
                asList(new LokalisointiDto(null, null, "avain1", "vanha_arvo1"),
                        new LokalisointiDto(null, null, "avain2", "vanha_arvo2")));
        Properties properties = new Properties();
        properties.put("avain2", "uusi_arvo2");
        properties.put("avain3", "uusi_arvo3");
        when(messageSource.getMessages(any())).thenReturn(properties);

        localizationServiceImpl.synchronize();

        verify(lokalisointiClient).update(lokalisointiDtoCollectionCaptor.capture());
        assertThat(lokalisointiDtoCollectionCaptor.getValue())
                .extracting("category", "key", "value")
                .containsExactly(tuple("henkilo-ui", "avain3", "uusi_arvo3"));
    }

}
