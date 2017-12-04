package fi.vm.sade.oppijanumerorekisteri.services;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import java.io.IOException;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import org.assertj.core.util.Maps;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyListOf;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anySetOf;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
public class PermissionCheckerTest {
    @MockBean
    private KayttooikeusClient kayttooikeusClient;
    @MockBean
    private OrganisaatioRepository organisaatioRepository;

    private PermissionChecker permissionChecker;

    @Before
    public void setup() {
        this.permissionChecker = new PermissionCheckerImpl(this.kayttooikeusClient, new UserDetailsHelperImpl(), organisaatioRepository);
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void isAllowedToAccessPersonAsAdmin() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Lists.newArrayList(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5")
    public void isAllowedToAccessPersonOwnData() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.5", Lists.newArrayList(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonFromKayttooikeusService() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUser(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyListOf(String.class), eq(null), anySetOf(String.class)))
                .willReturn(true);
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Lists.newArrayList(), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonNot() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUser(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyListOf(String.class), eq(null), anySetOf(String.class)))
                .willReturn(false);
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Lists.newArrayList(), null);
        assertThat(hasAccess).isFalse();
    }






    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void isAllowedToAccessPersonByPalveluRooliAsAdmin() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", Lists.newArrayList()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5")
    public void isAllowedToAccessPersonByPalveluRooliOwnData() throws Exception {
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.5", Maps.newHashMap("JOKUPALVELU", Lists.newArrayList()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonByPalveluRooliFromKayttooikeusService() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyMap(), eq(null), anySet()))
                .willReturn(true);
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", Lists.newArrayList()), null);
        assertThat(hasAccess).isTrue();
    }

    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = {"USER"})
    public void isAllowedToAccessPersonByPalveluRooliNot() throws Exception {
        given(this.kayttooikeusClient.checkUserPermissionToUserByPalveluRooli(eq("1.2.3.4.5"), eq("1.2.3.4.0"),
                anyMap(), eq(null), anySet()))
                .willReturn(false);
        boolean hasAccess = this.permissionChecker
                .isAllowedToAccessPerson("1.2.3.4.0", Maps.newHashMap("JOKUPALVELU", Lists.newArrayList()), null);
        assertThat(hasAccess).isFalse();
    }


    @Test
    @WithMockUser(value = "1.2.3.4.5", roles = "APP_HENKILONHALLINTA_OPHREKISTERI")
    public void isSuperUser() {
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
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_organisaatioOid0",
        "APP_OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI_organisaatioOid1"
    })
    public void isAllowedToAccessPersonTODO1() throws IOException {
        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("organisaatioOid1"));
        assertThat(permissionChecker.isAllowedToAccessPerson("henkiloOid", emptyList(), null)).isTrue();

        when(organisaatioRepository.findOidByHenkiloOid(eq("henkiloOid"))).thenReturn(singletonList("organisaatioOid2"));
        assertThat(permissionChecker.isAllowedToAccessPerson("henkiloOid", emptyList(), null)).isFalse();
    }
}
