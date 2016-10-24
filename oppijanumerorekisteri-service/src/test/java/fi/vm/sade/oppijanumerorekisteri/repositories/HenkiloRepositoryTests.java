package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.mappers.EntityUtils;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.dto.YhteystietoHakuDto;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.ConstraintViolationException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.KOTIOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma.TYOOSOITE;
import static fi.vm.sade.oppijanumerorekisteri.models.YhteystietoTyyppi.*;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.HenkiloPopulator.henkilo;
import static fi.vm.sade.oppijanumerorekisteri.repositories.populator.YhteystiedotRyhmaPopulator.ryhma;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@Transactional(readOnly = true)
public class HenkiloRepositoryTests extends AbstractRepositoryTest {
    @Autowired
    private HenkiloHibernateRepository repository;

    @Autowired
    private HenkiloRepository dataRepository;

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    public void userHasHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("123456");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        henkilo.setLuontiPvm(new Date());
        henkilo.setMuokkausPvm(henkilo.getLuontiPvm());
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.repository.findHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.orElse("").equals("123456"));
    }

    @Test
    public void userHasNoHetu() {
        Henkilo henkilo = new Henkilo();
        henkilo.setHetu("");
        henkilo.setOidhenkilo("1.2.3.4.5.6");
        henkilo.setHenkilotyyppi(HenkiloTyyppi.VIRKAILIJA);
        henkilo.setLuontiPvm(new Date());
        henkilo.setMuokkausPvm(henkilo.getLuontiPvm());
        this.testEntityManager.persist(henkilo);
        Optional<String> hetu = this.repository.findHetuByOid("1.2.3.4.5.6");
        assertThat(hetu.orElse("").isEmpty());
    }

    @Test
    public void userOidNotInDb() {
        Optional<String> hetu = this.repository.findHetuByOid("unknown oid");
        assertThat(hetu.isPresent()).isFalse();
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void createUserWithNullOid() {
        Henkilo henkiloWithNullOid = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", null, false,
                HenkiloTyyppi.OPPIJA, "fi", "suomi", "246");
//        testEntityManager.persist(henkiloWithNullOid);
        this.dataRepository.save(henkiloWithNullOid);
    }

    @Test(expected = ConstraintViolationException.class)
    public void createUserWithNullLuontiPvm() {
        Henkilo henkiloWithNullLuontiPvm = EntityUtils.createHenkilo("arpa", "arpa", "kuutio", "123456-9999", "1.2.3.4.5",
                false, HenkiloTyyppi.OPPIJA, "fi", "suomi", "246");
        henkiloWithNullLuontiPvm.setLuontiPvm(null);
        testEntityManager.persist(henkiloWithNullLuontiPvm);
//        this.dataRepository.save(henkilo);
    }
    
    @Test
    public void findYhteystiedotTest() {
        populate(henkilo("1.2.3.4.5")
            .withYhteystieto(ryhma(KOTIOSOITE)
                .tieto(YHTEYSTIETO_KATUOSOITE, "Kotikatu 3")
                .tieto(YHTEYSTIETO_POSTINUMERO, "12345")
                .tieto(YHTEYSTIETO_KAUPUNKI, "Toijala")
            )
            .withYhteystieto(ryhma(TYOOSOITE).alkupera("alkuperä")
                .tieto(YHTEYSTIETO_SAHKOPOSTI, "tyo@osoite.com")
            )
        );
        
        List<YhteystietoHakuDto> tiedot = this.repository.findYhteystiedot(new YhteystietoCriteria());
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.repository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("non-existing"));
        assertThat(tiedot.size()).isEqualTo(0);

        tiedot = this.repository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5"));
        assertThat(tiedot.size()).isEqualTo(4);

        tiedot = this.repository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid("1.2.3.4.5")
                    .withRyhma(TYOOSOITE));
        assertThat(tiedot.size()).isEqualTo(1);
        assertThat(tiedot.get(0).getArvo()).isEqualTo("tyo@osoite.com");
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
        assertThat(tiedot.get(0).getRyhmaAlkuperaTieto()).isEqualTo("alkuperä");
        assertThat(tiedot.get(0).getRyhmaKuvaus()).isEqualTo(TYOOSOITE.getRyhmanKuvaus());
        assertThat(tiedot.get(0).getHenkiloOid()).isEqualTo("1.2.3.4.5");
    }
}
