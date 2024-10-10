package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.PermissionCheckDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.clients.Oauth2Client;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioCriteria;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import lombok.RequiredArgsConstructor;

@Component
@ConditionalOnExpression("${oppijanumerorekisteri.oauth2.enabled:false}")
@RequiredArgsConstructor
public class KayttooikeusOauth2ClientImpl implements KayttooikeusClient {
    private final UrlConfiguration urlConfiguration;
    private final ObjectMapper objectMapper;
    private final Oauth2Client httpClient;

    @Override
    public Optional<KayttajaReadDto> getKayttajaByOid(String oid) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.byOid", oid);
        var request = HttpRequest.newBuilder().uri(URI.create(url)).GET();
        String body = httpClient.executeRequest(request).body();
        return Optional.of(ioExceptionToRestClientException(() -> objectMapper.readValue(body, KayttajaReadDto.class)));
    }

    @Override
    public boolean checkUserPermissionToUserByPalveluRooli(String callingUserOid, String userOid, Map<String, List<String>> allowedPalveluRooli,
                                             ExternalPermissionService externalPermissionService, Set<String> callingUserRoles) {
        PermissionCheckDto permissionCheckDto = new PermissionCheckDto();
        permissionCheckDto.setAllowedPalveluRooli(allowedPalveluRooli);
        permissionCheckDto.setCallingUserOid(callingUserOid);
        permissionCheckDto.setCallingUserRoles(callingUserRoles);
        permissionCheckDto.setExternalPermissionService(externalPermissionService);
        permissionCheckDto.setUserOid(userOid);
        String url = this.urlConfiguration.url("kayttooikeus-service.s2s-checkUserPermissionToUser");
        var request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString(ioExceptionToRestClientException(() -> objectMapper.writeValueAsString(permissionCheckDto))));
        String body = httpClient.executeRequest(request).body();
        return ioExceptionToRestClientException(() -> objectMapper.readerFor(Boolean.class).readValue(body));
    }

    @Override
    public void passivoiHenkilo(String oidHenkilo, String kasittelijaOid) {
        String url = getPassivoiHenkiloUrl(oidHenkilo, kasittelijaOid);
        var request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .DELETE();
        httpClient.executeRequest(request);
    }

    protected String getPassivoiHenkiloUrl(String oidHenkilo, String kasittelijaOid) {
        Map<String, Object> queryParameters = new LinkedHashMap<>();
        queryParameters.put("kasittelijaOid", kasittelijaOid);
        return this.urlConfiguration.url("kayttooikeus-service.henkilo-passivoi", oidHenkilo, queryParameters);
    }

    @Override
    public KayttooikeudetDto getHenkiloKayttooikeudet(String henkiloOid, OrganisaatioCriteria criteria) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.sallitut", henkiloOid);
        return getHenkiloKayttooikeudetByUrl(url, criteria);
    }

    private KayttooikeudetDto getHenkiloKayttooikeudetByUrl(String url, OrganisaatioCriteria criteria) {
        String requestJson = ioExceptionToRestClientException(() -> objectMapper.writeValueAsString(criteria));
        var request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString(requestJson));
        String body = httpClient.executeRequest(request).body();
        KayttooikeudetDto kayttooikeudet = ioExceptionToRestClientException(() -> objectMapper.readValue(body, KayttooikeudetDto.class));
        if (!kayttooikeudet.isAdmin() && kayttooikeudet.getOids() == null) {
            throw new DataInconsistencyException("Käyttöoikeuspalvelu palautti epäkonsistenttia tietoa");
        }
        return kayttooikeudet;
    }

}
