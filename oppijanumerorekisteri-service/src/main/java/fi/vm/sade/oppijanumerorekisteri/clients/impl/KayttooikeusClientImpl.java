package fi.vm.sade.oppijanumerorekisteri.clients.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.javautils.http.OphHttpClient;
import fi.vm.sade.javautils.http.OphHttpEntity;
import fi.vm.sade.javautils.http.OphHttpRequest;
import fi.vm.sade.javautils.http.auth.CasAuthenticator;
import fi.vm.sade.kayttooikeus.dto.KayttooikeudetDto;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.ExternalPermissionService;
import fi.vm.sade.kayttooikeus.dto.permissioncheck.PermissionCheckDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.configurations.ConfigEnums;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.AuthenticationProperties;
import fi.vm.sade.oppijanumerorekisteri.configurations.properties.UrlConfiguration;
import fi.vm.sade.oppijanumerorekisteri.dto.KayttajaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OrganisaatioCriteria;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import lombok.RequiredArgsConstructor;
import org.apache.http.entity.ContentType;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;

import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.ioExceptionToRestClientException;
import static fi.vm.sade.oppijanumerorekisteri.clients.impl.HttpClientUtil.noContentOrNotFoundException;
import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class KayttooikeusClientImpl implements KayttooikeusClient {

    private OphHttpClient httpClient;
    private final UrlConfiguration urlConfiguration;
    private final ObjectMapper objectMapper;
    private final AuthenticationProperties authenticationProperties;

    @PostConstruct
    public void setup() {
        CasAuthenticator authenticator = new CasAuthenticator.Builder()
                .username(authenticationProperties.getKayttooikeus().getUsername())
                .password(authenticationProperties.getKayttooikeus().getPassword())
                .webCasUrl(urlConfiguration.url("cas.url"))
                .casServiceUrl(urlConfiguration.url("kayttooikeus-service.security-check"))
                .build();

        this.httpClient = new OphHttpClient.Builder(ConfigEnums.SUBSYSTEMCODE.value()).authenticator(authenticator).build();
    }

    @Override
    public Optional<KayttajaReadDto> getKayttajaByOid(String oid) {
        String url = urlConfiguration.url("kayttooikeus-service.henkilo.byOid", oid);
        return httpClient.<KayttajaReadDto>execute(OphHttpRequest.Builder.get(url).build())
                .expectedStatus(200)
                .mapWith(json -> ioExceptionToRestClientException(() -> objectMapper.readValue(json, KayttajaReadDto.class)));
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
        OphHttpRequest request = OphHttpRequest.Builder.post(url)
                .setEntity(new OphHttpEntity.Builder()
                        .content(ioExceptionToRestClientException(() -> objectMapper.writeValueAsString(permissionCheckDto)))
                        .contentType(ContentType.APPLICATION_JSON)
                        .build())
                .build();
        return httpClient.<Boolean>execute(request)
                .expectedStatus(200)
                .mapWith(json -> ioExceptionToRestClientException(() -> objectMapper.readerFor(Boolean.class).readValue(json)))
                .orElseThrow(() -> noContentOrNotFoundException(url));
    }

    @Override
    public void passivoiHenkilo(String oidHenkilo, String kasittelijaOid) {
        String url = getPassivoiHenkiloUrl(oidHenkilo, kasittelijaOid);
        httpClient.<String>execute(OphHttpRequest.Builder.delete(url).build())
                .expectedStatus(200)
                .mapWith(identity())
                .orElseThrow(() -> noContentOrNotFoundException(url));
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
        OphHttpRequest request = OphHttpRequest.Builder.post(url)
                .setEntity(new OphHttpEntity.Builder()
                        .content(requestJson)
                        .contentType(ContentType.APPLICATION_JSON)
                        .build())
                .build();
        KayttooikeudetDto kayttooikeudet = httpClient.<KayttooikeudetDto>execute(request)
                .expectedStatus(200)
                .mapWith(responseJson -> ioExceptionToRestClientException(() -> objectMapper.readValue(responseJson, KayttooikeudetDto.class)))
                .orElseThrow(() -> noContentOrNotFoundException(url));
        if (!kayttooikeudet.isAdmin() && kayttooikeudet.getOids() == null) {
            throw new DataInconsistencyException("Käyttöoikeuspalvelu palautti epäkonsistenttia tietoa");
        }
        return kayttooikeudet;
    }

}
