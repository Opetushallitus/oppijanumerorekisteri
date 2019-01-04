package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import lombok.RequiredArgsConstructor;
import org.apache.http.entity.ContentType;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;
import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.noContentOrNotFoundException;

@Component
@RequiredArgsConstructor
public class HakuappClientImpl implements HakuappClient {

    private OphHttpClient httpClient;
    private final UrlConfiguration urlConfiguration;
    private final ObjectMapper objectMapper;
    private final AuthenticationProperties authenticationProperties;

    @PostConstruct
    public void setup() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getHakuapp().getUsername())
                .password(authenticationProperties.getHakuapp().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.haku-app"))
                .build();

        this.httpClient = new OphHttpClient.Builder(ConfigEnums.SUBSYSTEMCODE.value()).authenticator(authenticator).build();
    }

    @Override
    public Map<String, List<HakemusDto>> fetchApplicationsByOid(Set<String> oids) {
        String url = this.urlConfiguration.url("haku-app.applications");
        OphHttpRequest request = OphHttpRequest.Builder.post(url)
                .setEntity(new OphHttpEntity.Builder()
                        .content(ioExceptionToRestClientException(() -> objectMapper.writeValueAsString(Sets.newHashSet(oids))))
                        .contentType(ContentType.APPLICATION_JSON)
                        .build())
                .build();
        Map<String, List<Map<String, Object>>> applicationsByPersonOid = httpClient.<Map<String, List<Map<String, Object>>>>execute(request)
                .expectedStatus(200)
                .mapWith(json -> ioExceptionToRestClientException(() -> objectMapper.readValue(json, new TypeReference<Map<String, List<Map<String, Object>>>>() {})))
                .orElseThrow(() -> noContentOrNotFoundException(url));
        Map<String, List<HakemusDto>> hakemuksetByHenkiloOid = new HashMap<>();
        applicationsByPersonOid.keySet().forEach( henkiloOid -> {
            List<Map<String, Object>> hakemukset = applicationsByPersonOid.get(henkiloOid);
            List<HakemusDto> hakemusList = hakemukset.stream().map(hakemusData -> {
                hakemusData.put("service", "haku-app");
                return new HakemusDto(hakemusData);
            }).collect(Collectors.toList());

            hakemuksetByHenkiloOid.put(henkiloOid, hakemusList);
        });

        return hakemuksetByHenkiloOid;
    }
}
