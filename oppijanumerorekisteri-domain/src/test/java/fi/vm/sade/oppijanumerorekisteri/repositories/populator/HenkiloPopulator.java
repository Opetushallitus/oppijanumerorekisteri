package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class HenkiloPopulator implements Populator<Henkilo> {
    private final String oid;
    private final List<Populator<YhteystiedotRyhma>> yhteystietoRyhmas = new ArrayList<>();
    private String hetu;
    private HenkiloTyyppi tyyppi = HenkiloTyyppi.VIRKAILIJA;

    public HenkiloPopulator(String oid) {
        this.oid = oid;
    }

    public static HenkiloPopulator henkilo(String oid) {
        return new HenkiloPopulator(oid);
    }

    public HenkiloPopulator tyyppi(HenkiloTyyppi tyyppi) {
        this.tyyppi = tyyppi;
        return this;
    }
    
    public HenkiloPopulator hetu(String hetu) {
        this.hetu = hetu;
        return this;
    }
    
    public HenkiloPopulator withYhteystieto(Populator<YhteystiedotRyhma> ryhma) {
        yhteystietoRyhmas.add(ryhma);
        return this;
    }
    
    @Override
    public Henkilo apply(EntityManager entityManager) {
        return Populator.<Henkilo>firstOptional(entityManager.createQuery("select h from Henkilo h " +
                "   where h.oidHenkilo = :oid").setParameter("oid", oid)).orElseGet(() -> {
            Henkilo henkilo = new Henkilo();
            henkilo.setOidHenkilo(oid);
            henkilo.setHetu(hetu);
            henkilo.setLuontiPvm(new Date());
            henkilo.setMuokkausPvm(henkilo.getLuontiPvm());
            henkilo.setHenkiloTyyppi(tyyppi);
            entityManager.persist(henkilo);

            yhteystietoRyhmas.forEach(ryhmaPopulator -> {
                YhteystiedotRyhma ryhma = ryhmaPopulator.apply(entityManager);
                ryhma.setHenkilo(henkilo);
                henkilo.getYhteystiedotRyhmas().add(ryhma);
            });

            return entityManager.merge(henkilo);
        });
    }
}
