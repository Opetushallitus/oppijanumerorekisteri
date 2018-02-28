package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OrikaConfiguration.class, DuplicateServiceImpl.class}, webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class DuplicateServiceImplTest {
    @Autowired
    private OrikaConfiguration mapper;

    @Autowired
    private DuplicateService duplicateService;

    @MockBean
    private AtaruClient ataruClient;

    @MockBean
    private HakuappClient hakuappClient;

    @MockBean
    private UserDetailsHelper userDetailsHelper;

    @MockBean
    private HenkiloRepository henkiloRepository;

    @MockBean
    private HenkiloViiteRepository HenkiloViiteRepository;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @Test
    public void getHenkiloDuplicateDtoListShouldReturnApplicationsFromAtaruAndHakuApp() {
        Henkilo henkilo1 = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "hetu", "1.2.3.4.5", false, HenkiloTyyppi.OPPIJA, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Henkilo henkilo2 = EntityUtils.createHenkilo("arpa2 noppa2", "arpa2", "kuutio2", "hetu2", "1.2.3.4.6", false, HenkiloTyyppi.OPPIJA, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Henkilo henkilo3 = EntityUtils.createHenkilo("arpa3 noppa3", "arpa3", "kuutio3", "hetu3", "1.3.3.4.7", false, HenkiloTyyppi.OPPIJA, "fi", "FI", "2.3.34.56", new Date(), new Date(), "2.3.34.5", "arvo");
        List<Henkilo> henkilos = Arrays.asList(henkilo1, henkilo2, henkilo3);
        given(this.userDetailsHelper.getCurrentUserOid()).willReturn("1.2.3.4.5");
        HashMap<String, Object> hakemus1 = new HashMap<>();
        hakemus1.put("service", "ataru");
        HashMap<String, Object> hakemus2 = new HashMap<>();
        hakemus2.put("service", "haku-app");

        HakemusDto hakemusDto1 = new HakemusDto(hakemus1);
        HakemusDto hakemusDto2 = new HakemusDto(hakemus2);

        HashMap<String, List<HakemusDto>> ataruApplications = new HashMap<String, List<HakemusDto>>() { { put("1.2.3.4.6", Arrays.asList(hakemusDto1)); }; };
        HashMap<String, List<HakemusDto>> hakuAppApplications = new HashMap<String, List<HakemusDto>>() { { put("1.3.3.4.7", Arrays.asList(hakemusDto2)); put("1.2.3.4.6", Lists.newArrayList(hakemusDto2)); } };

        hakuAppApplications.put("1.3.3.4.7", Lists.newArrayList(hakemusDto2));

        given(this.ataruClient.fetchApplicationsByOid(any())).willReturn(ataruApplications);
        given(this.hakuappClient.fetchApplicationsByOid(any())).willReturn(hakuAppApplications);

        List<HenkiloDuplicateDto> duplicates = ReflectionTestUtils.invokeMethod(duplicateService, "getHenkiloDuplicateDtoList", henkilos);

        assertThat(duplicates.size()).isEqualTo(2); // filter current user
        HenkiloDuplicateDto henkiloDuplicateDto2 = duplicates.get(0);
        assertThat(henkiloDuplicateDto2.getHakemukset().size()).isEqualTo(2);
        assertThat(henkiloDuplicateDto2.getHakemukset()).contains(hakemusDto1);
        assertThat(henkiloDuplicateDto2.getHakemukset()).contains(hakemusDto2);

        HenkiloDuplicateDto henkiloDuplicateDto3 = duplicates.get(1);
        assertThat(henkiloDuplicateDto3.getHakemukset().size()).isEqualTo(1);
        assertThat(henkiloDuplicateDto3.getHakemukset()).contains(hakemusDto2);


    }


}