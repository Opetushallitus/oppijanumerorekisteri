package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.HenkiloViite;
import fi.vm.sade.oppijanumerorekisteri.models.YhteystiedotRyhma;
import org.joda.time.DateTime;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

public class HenkiloPopulator implements Populator<Henkilo> {
    private final String oid;
    private final List<Populator<YhteystiedotRyhma>> yhteystietoRyhmas = new ArrayList<>();
    private String hetu;
    private HenkiloTyyppi tyyppi = HenkiloTyyppi.VIRKAILIJA;
    private Populator<Henkilo> master;
    private DateTime created;
    private DateTime modified;

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
    
    public HenkiloPopulator withMaster(Populator<Henkilo> populator) {
        this.master = populator;
        return this;
    }

    public HenkiloPopulator modified(DateTime at) {
        this.modified = at;
        return this;
    }

    public HenkiloPopulator created(DateTime at) {
        this.created = at;
        return this;
    }

    @Override
    public Henkilo apply(EntityManager entityManager) {
        Optional<Henkilo> masterHenkilo = ofNullable(master).map(m -> m.apply(entityManager));
        Henkilo result = Populator.<Henkilo>firstOptional(entityManager.createQuery("select h from Henkilo h " +
                "   where h.oidHenkilo = :oid").setParameter("oid", oid)).orElseGet(() -> {
            Henkilo henkilo = new Henkilo();
            henkilo.setOidHenkilo(oid);
            henkilo.setHetu(hetu);
            henkilo.setCreated(created == null ? new Date() : created.toDate());
            henkilo.setModified(modified != null ? modified.toDate() : henkilo.getCreated());
            henkilo.setHenkiloTyyppi(tyyppi);
            entityManager.persist(henkilo);

            yhteystietoRyhmas.forEach(ryhmaPopulator -> {
                YhteystiedotRyhma ryhma = ryhmaPopulator.apply(entityManager);
                henkilo.getYhteystiedotRyhma().add(ryhma);
            });

            return entityManager.merge(henkilo);
        });
        if (masterHenkilo.isPresent()) {
            Populator.firstOptional(entityManager.createQuery("select v from HenkiloViite v " +
                    "   where v.masterOid = :masterOid and v.slaveOid = :slaveOid")
                            .setParameter("masterOid", masterHenkilo.get().getOidHenkilo())
                            .setParameter("slaveOid", result.getOidHenkilo())).orElseGet(() -> {
                HenkiloViite viite = new HenkiloViite();
                viite.setMasterOid(masterHenkilo.get().getOidHenkilo());
                viite.setSlaveOid(result.getOidHenkilo());
                entityManager.persist(viite);
                return viite;
            });
        }
        return result;
    }
}
