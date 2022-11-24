package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.google.common.collect.Lists;
import fi.vm.sade.oppijanumerorekisteri.KoodistoServiceMock;
import fi.vm.sade.oppijanumerorekisteri.clients.AtaruClient;
import fi.vm.sade.oppijanumerorekisteri.clients.HakuappClient;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HakemusDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplicateDto;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloViiteRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.KansalaisuusRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.DuplicateService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import org.assertj.core.groups.Tuple;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {OrikaConfiguration.class, DuplicateServiceImpl.class, KoodistoServiceMock.class}, webEnvironment = SpringBootTest.WebEnvironment.NONE)
public class DuplicateServiceImplTest {
    @Autowired
    private OrikaConfiguration mapper;

    @MockBean
    private TuontiRepository tuontiRepository;

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
    private HenkiloViiteRepository henkiloViiteRepository;

    @MockBean
    private KayttooikeusClient kayttooikeusClient;

    @MockBean
    private KansalaisuusRepository kansalaisuusRepository;

    @Test
    public void getHenkiloDuplicateDtoListShouldReturnApplicationsFromAtaruAndHakuApp() {
        Henkilo henkilo1 = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", "hetu", "1.2.3.4.5", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Henkilo henkilo2 = EntityUtils.createHenkilo("arpa2 noppa2", "arpa2", "kuutio2", "hetu2", "1.2.3.4.6", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Henkilo henkilo3 = EntityUtils.createHenkilo("arpa3 noppa3", "arpa3", "kuutio3", "hetu3", "1.3.3.4.7", false, "fi", "FI", "2.3.34.56", new Date(), new Date(), "2.3.34.5", "arvo");
        List<Henkilo> henkilos = Arrays.asList(henkilo1, henkilo2, henkilo3);
        given(this.userDetailsHelper.getCurrentUserOid()).willReturn("1.2.3.4.5");
        HashMap<String, Object> hakemus1 = new HashMap<>();
        hakemus1.put("service", "ataru");
        HashMap<String, Object> hakemus2 = new HashMap<>();
        hakemus2.put("service", "haku-app");

        HakemusDto hakemusDto1 = new HakemusDto(hakemus1);
        HakemusDto hakemusDto2 = new HakemusDto(hakemus2);

        HashMap<String, List<HakemusDto>> ataruApplications = new HashMap<String, List<HakemusDto>>() { { put("1.2.3.4.6", Arrays.asList(hakemusDto1)); } };
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

    @Test
    public void linkHenkiloseShouldMoveAllIdentificationsToNewMaster() {
        Henkilo henkilo1 = EntityUtils.createHenkilo("arpa noppa", "arpa", "kuutio", null, "1.2.3.4.5", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Identification arpaIdentification1 = EntityUtils.createIdentification("email", "arpa@noppa.com");
        Identification arpaIdentification2 = EntityUtils.createIdentification("haka", "arpahaka");
        HashSet<Identification> identification1 = new HashSet<>();
        identification1.add(arpaIdentification1);
        identification1.add(arpaIdentification2);
        henkilo1.setIdentifications(identification1);

        Henkilo henkilo2 = EntityUtils.createHenkilo("arpa2 noppa2", "arpa2", "kuutio2", null, "1.2.3.4.6", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        Identification arpa2Identification1 = EntityUtils.createIdentification("email", "arpa2@noppa2.com");
        Identification arpa2Identification2 = EntityUtils.createIdentification("haka", "arpa2haka");
        HashSet<Identification> identification2 = new HashSet<>();
        identification2.add(arpa2Identification1);
        identification2.add(arpa2Identification2);
        henkilo2.setIdentifications(identification2);

        Henkilo henkilo3 = EntityUtils.createHenkilo("arpa3 noppa3", "arpa3", "kuutio3", null, "1.3.3.4.7", false, "fi", "FI", "2.3.34.56", new Date(), new Date(), "2.3.34.5", "arvo");
        Identification arpa3Identification1 = EntityUtils.createIdentification("email", "arpa3@noppa3.com");
        HashSet<Identification> identification3 = new HashSet<>();
        identification3.add(arpa3Identification1);
        henkilo3.setIdentifications(identification3);

        ArrayList<String> candidateOids = new ArrayList<>();
        candidateOids.add(henkilo2.getOidHenkilo());
        candidateOids.add(henkilo3.getOidHenkilo());

        given(this.henkiloViiteRepository.findBySlaveOid(any())).willReturn(new ArrayList<>());
        given(this.henkiloRepository.findByOidHenkilo(henkilo1.getOidHenkilo())).willReturn(Optional.of(henkilo1));
        given(this.henkiloRepository.findByOidHenkilo(henkilo2.getOidHenkilo())).willReturn(Optional.of(henkilo2));
        given(this.henkiloRepository.findByOidHenkilo(henkilo3.getOidHenkilo())).willReturn(Optional.of(henkilo3));

        assertThat(henkilo1.getIdentifications())
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .containsExactlyInAnyOrder(Tuple.tuple("haka", "arpahaka"), Tuple.tuple("email", "arpa@noppa.com"));
        this.duplicateService.linkHenkilos(henkilo1.getOidHenkilo(), candidateOids);
        assertThat(henkilo1.getIdentifications())
                .extracting(Identification::getIdpEntityId, Identification::getIdentifier)
                .containsExactlyInAnyOrder(Tuple.tuple("haka", "arpahaka"),
                        Tuple.tuple("email", "arpa@noppa.com"),
                        Tuple.tuple("email", "arpa2@noppa2.com"),
                        Tuple.tuple("email", "arpa3@noppa3.com"),
                        Tuple.tuple("haka", "arpa2haka"));
        assertThat(henkilo2.getIdentifications()).isEmpty();
        assertThat(henkilo3.getIdentifications()).isEmpty();
    }

    @Test
    public void removeDuplicateHetuAndLinkShouldMoveHetusToNewMasterAndRemoveThemFromNewSlave() {

        Henkilo existingDuplicateHenkilo = EntityUtils.createHenkilo("Testi Henkilö", "Testi", "Sukunimi1", "hetu", "1.2.3.4.5", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");
        existingDuplicateHenkilo.addHetu("hetu1", "hetu2");
        existingDuplicateHenkilo.setYksiloityVTJ(true);

        Henkilo newStronglyIdentifiedHenkilo = EntityUtils.createHenkilo("Testi2 Henkilö2", "Testi2", "Sukunimi2", "hetu", "2.3.4.5.6", false, "fi", "FI", "2.3.34.5", new Date(), new Date(), "2.3.34.5", "arvo");

        given(this.henkiloRepository.findByHetu("hetu")).willReturn(Optional.of(existingDuplicateHenkilo));
        given(this.henkiloRepository.findByOidHenkilo("1.2.3.4.5")).willReturn(Optional.of(existingDuplicateHenkilo));
        given(this.henkiloRepository.findByOidHenkilo("2.3.4.5.6")).willReturn(Optional.of(newStronglyIdentifiedHenkilo));

        this.duplicateService.removeDuplicateHetuAndLink(newStronglyIdentifiedHenkilo, "hetu");

        assertThat(existingDuplicateHenkilo.isYksiloityVTJ()).isFalse();
        assertThat(newStronglyIdentifiedHenkilo.getKaikkiHetut()).containsExactly("hetu1", "hetu2");
        assertThat(existingDuplicateHenkilo.getKaikkiHetut()).isEmpty();

    }

    @Test
    public void findDuplicates() {
        Henkilo subject = mock(Henkilo.class);
        Henkilo duplicate = mock(Henkilo.class);

        given(subject.getOidHenkilo()).willReturn("subject");
        given(duplicate.getOidHenkilo()).willReturn("duplicate");
        given(henkiloRepository.findByOidHenkilo(subject.getOidHenkilo())).willReturn(Optional.of(subject));
        given(henkiloViiteRepository.findBySlaveOid(subject.getOidHenkilo())).willReturn(List.of());
        given(henkiloRepository.findDuplikaatit(any())).willReturn(List.of(duplicate));

        List<HenkiloDuplicateDto> result = duplicateService.findDuplicates(subject.getOidHenkilo());

        assertThat(result).hasSize(1);
    }

    @Test
    public void filterMasterFromDuplicates() {
        Henkilo subject = mock(Henkilo.class);
        Henkilo duplicate = mock(Henkilo.class);
        HenkiloViite reference = mock(HenkiloViite.class);

        given(subject.getOidHenkilo()).willReturn("subject");
        given(duplicate.getOidHenkilo()).willReturn("duplicate");
        given(reference.getMasterOid()).willReturn("duplicate");
        given(henkiloRepository.findByOidHenkilo(subject.getOidHenkilo())).willReturn(Optional.of(subject));
        given(henkiloViiteRepository.findBySlaveOid(subject.getOidHenkilo())).willReturn(List.of(reference));
        given(henkiloRepository.findDuplikaatit(any())).willReturn(List.of(duplicate));

        List<HenkiloDuplicateDto> result = duplicateService.findDuplicates(subject.getOidHenkilo());

        assertThat(result).isEmpty();
    }
}
