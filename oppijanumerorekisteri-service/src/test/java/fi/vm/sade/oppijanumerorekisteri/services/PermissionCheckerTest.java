package fi.vm.sade.oppijanumerorekisteri.services;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl;
import fi.vm.sade.oppijanumerorekisteri.services.impl.UserDetailsHelperImpl;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Matchers.*;

@RunWith(SpringRunner.class)
public class PermissionCheckerTest {
    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    private PermissionChecker permissionChecker;

    @Before
    public void setup() {
        this.permissionChecker = new PermissionCheckerImpl(this.kayttooikeusClient, new UserDetailsHelperImpl());
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
}
