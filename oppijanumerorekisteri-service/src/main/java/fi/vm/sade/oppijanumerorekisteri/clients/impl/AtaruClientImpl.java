package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.HttpConnectionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AtaruClientImpl implements AtaruClient{

    private final ObjectMapper objectMapper;
    private final UrlConfiguration urlConfiguration;
    private final AuthenticationProperties authenticationProperties;
    private final OphHttpClient ophHttpClient;

    @Autowired
    public AtaruClientImpl(ObjectMapper objectMapper, UrlConfiguration urlConfiguration,
                           AuthenticationProperties authenticationProperties) {
        this.authenticationProperties = authenticationProperties;
        this.objectMapper = objectMapper;
        this.urlConfiguration = urlConfiguration;
        this.ophHttpClient = createOphHttpClient();
    }

    @Override
    public Map<String, List<HakemusDto>> fetchApplicationsByOid(Set<String> oids) {
        TypeReference<List<Map<String, Object>>> hakemusType = new TypeReference<List<Map<String, Object>>>() {};
        return oids.stream().collect(Collectors.toMap(Function.identity(), oid -> fetchByOid(oid, hakemusType)));
    }

    private List<HakemusDto> fetchByOid(String oid, TypeReference<List<Map<String, Object>>> hakemusType) {
        String url = urlConfiguration.url("ataru.applications", oid);
        OphHttpRequest request = OphHttpRequest.Builder.get(url).build();
        return this.ophHttpClient.<List<HakemusDto>>execute(request)
                .expectedStatus(200)
                .mapWith(json -> jsonToHakemusDtoList(oid, json, hakemusType))
                .orElseThrow(() -> new HttpConnectionException("Failed to fetch applications from ataru. Status code: 204 or 404. Requested applications for user: " + oid));
    }

    private List<HakemusDto> jsonToHakemusDtoList(String oid, String json, TypeReference<List<Map<String, Object>>> hakemusType) {
        try {
            return jsonToHakemusDtoList(json, hakemusType);
        } catch (IOException e) {
            throw new HttpConnectionException("Failed to read response from ataru. Requested applications for user oid: " + oid, e);
        }
    }

    private List<HakemusDto> jsonToHakemusDtoList(String json, TypeReference<List<Map<String, Object>>> hakemusType) throws IOException {
        List<Map<String, Object>> hakemukset = objectMapper.readValue(json, hakemusType);
        List<HakemusDto> hakemusList = hakemukset.stream().map(hakemusData -> {
            hakemusData.put("service", "ataru");
            return new HakemusDto(hakemusData);
        }).collect(Collectors.toList());
        return hakemusList;
    }

    private OphHttpClient createOphHttpClient() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getAtaru().getUsername())
                .password(authenticationProperties.getAtaru().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("cas.service.ataru"))
                .casServiceSessionInitUrl(urlConfiguration.url("cas.service.ataru"))
                .sessionCookieName("ring-session")
                .addSpringSecSuffix(false)
                .build();

        return new OphHttpClient.Builder(ConfigEnums.SUBSYSTEMCODE.value()).authenticator(authenticator).build();
    }
}
