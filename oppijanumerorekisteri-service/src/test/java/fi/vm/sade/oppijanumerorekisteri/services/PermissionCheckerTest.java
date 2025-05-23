package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.assertj.core.util.Maps;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import static java.util.Collections.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
public class PermissionCheckerTest {
    @MockitoBean
    private KayttooikeusClient kayttooikeusClient;
    @MockitoBean
    private OrganisaatioRepository organisaatioRepository;
    @MockitoBean
    private OrganisaatioService organisaatioService;

    private PermissionChecker permissionChecker;

    @Before
    public void setup() {
        this.permissionChecker = new PermissionCheckerImpl(this.kayttooikeusClient, new UserDetailsHelperImpl(), organisaatioRepository, organisaatioService);
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isAllowedToAccessPersonAsAdmin() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", new HashMap<>(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isAllowedToAccessPersonAsRekisterinpitaja() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", new HashMap<>(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5")
    public void isAllowedToAccessPersonOwnData() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.5", new HashMap<>(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonFromKayttooikeusService() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyMap(), eq(null), anySet()))
                .willReturn(true);
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", new HashMap<>(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonNot() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", new HashMap<>(), null);
        assertThat(hasAccess).isFalse();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isAllowedToAccessPersonByPalveluRooliAsAdmin() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", List.of()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isAllowedToAccessPersonByPalveluRooliAsRekisterinpitaja() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", List.of()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5")
    public void isAllowedToAccessPersonByPalveluRooliOwnData() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.5", Maps.newHashMap("JOKUPALVELU", List.of()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonByPalveluRooliFromKayttooikeusService() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyMap(), eq(null), anySet()))
                .willReturn(true);
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", List.of()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonByPalveluRooliNot() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyMap(), eq(null), anySet()))
                .willReturn(false);
        boolean hasAccess = this.permissionChecker
                .isAllowedToModifyPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", List.of()), null);
        assertThat(hasAccess).isFalse();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {
            "APP_OPPIJANUMEROREKISTERI_READ_1.2.246.562.10.12345678901",
            "APP_OPPIJANUMEROREKISTERI_CRUD_1.2.246.562.10.98765432109",
            "_",
            "__",
            "",
            "outoRooli",
            "1.2.246.562.10.66666666666"
    })
    public void getOrganisaatioOids() {
        assertThat(permissionChecker.getOrganisaatioOids())
                .containsExactlyInAnyOrder("1.2.246.562.10.12345678901", "1.2.246.562.10.98765432109", "1.2.246.562.10.66666666666");
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {
            "APP_OPPIJANUMEROREKISTERI_READ_1.2.246.562.10.00000000001",
            "APP_OPPIJANUMEROREKISTERI_CRUD_1.2.246.562.10.98765432109",
    })
    public void getOrganisaatioOidsWithKayttooikeus() {
        assertThat(permissionChecker.getOrganisaatioOids("OPPIJANUMEROREKISTERI", "READ"))
                .containsExactlyInAnyOrder("1.2.246.562.10.00000000001");
        assertThat(permissionChecker.getOrganisaatioOids("OPPIJANUMEROREKISTERI", "UPDATE"))
                .isEmpty();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isSuperUser() {
        boolean isSuperUser = this.permissionChecker.isSuperUser();
        assertThat(isSuperUser).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_OPPIJANUMEROREKISTERI_REKISTERINPITAJA_1.2.246.562.10.00000000001")
    public void isRekisterinpitaja() {
        boolean isSuperUser = this.permissionChecker.isSuperUser();
        assertThat(isSuperUser).isTrue();
    }

    @Test
    @WithMockUser("1.2.3.4.5")
    public void isSuperUserNot() {
        boolean isSuperUser = this.permissionChecker.isSuperUser();
        assertThat(isSuperUser).isFalse();
    }

    @Test
    @WithMockUser(value = "kayttajaOid", roles = {
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI",
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.0",
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.1"
    })
    public void isAllowedToAccessPersonTODO1() throws IOException {
        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.1"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", new HashMap<>(), null)).isTrue();

        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.2"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", new HashMap<>(), null)).isFalse();
    }

    @Test
    @WithMockUser(value = "kayttajaOid", roles = {
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI",
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.0",
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.1"
    })
    public void isAllowedToAccessPersonTODO2() throws IOException {
        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.1"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", emptyMap(), null)).isTrue();

        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.2"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", emptyMap(), null)).isFalse();
    }

    @Test
    @WithMockUser(value = "kayttajaOid", roles = {
            "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI",
            "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.0",
            "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_1.2.246.562.10.1"
    })
    public void isAllowedToAccessPersonOppijoidenTuontiAliorganisaatio() throws IOException {
        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.1.1"));
        when(organisaatioService.getChildOids(eq("1.2.246.562.10.1"), anyBoolean(), any())).thenReturn(singleton("1.2.246.562.10.1.1"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", emptyMap(), null)).isTrue();

        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("1.2.246.562.10.1.2"));
        assertThat(permissionChecker.isAllowedToModifyPerson("henkiloOid", emptyMap(), null)).isFalse();
    }
}
