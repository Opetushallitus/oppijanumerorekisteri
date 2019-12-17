package fi.vm.sade.oppijanumerorekisteri.repositories.populator;

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
    private String etunimet = "";
    private String kutsumanimi = "";
    private String sukunimi = "";
    private Populator<Henkilo> master;
    private DateTime created;
    private DateTime modified;
    private boolean passivoitu;
    private boolean duplikaatti;
    private boolean yksilointiYritetty;
    private boolean yksiloity;
    private boolean yksiloityVtj;

    public HenkiloPopulator(String oid) {
        this.oid = oid;
    }

    public static HenkiloPopulator henkilo(String oid) {
        return new HenkiloPopulator(oid);
    }
    
    public HenkiloPopulator hetu(String hetu) {
        this.hetu = hetu;
        return this;
    }

    public HenkiloPopulator etunimet(String etunimet) {
        this.etunimet = etunimet;
        return this;
    }

    public HenkiloPopulator kutsumanimi(String kutsumanimi) {
        this.kutsumanimi = kutsumanimi;
        return this;
    }

    public HenkiloPopulator sukunimi(String sukunimi) {
        this.sukunimi = sukunimi;
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

    public HenkiloPopulator passivoitu() {
        this.passivoitu = true;
        return this;
    }

    public HenkiloPopulator duplikaatti() {
        this.duplikaatti = true;
        return this;
    }

    public HenkiloPopulator yksilointiYritetty() {
        this.yksilointiYritetty = true;
        return this;
    }

    public HenkiloPopulator yksiloity() {
        this.yksiloity = true;
        return this;
    }

    public HenkiloPopulator yksiloityVtj() {
        this.yksiloityVtj = true;
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
            henkilo.setEtunimet(etunimet);
            henkilo.setKutsumanimi(kutsumanimi);
            henkilo.setSukunimi(sukunimi);
            henkilo.setCreated(created == null ? new Date() : created.toDate());
            henkilo.setModified(modified != null ? modified.toDate() : henkilo.getCreated());
            henkilo.setPassivoitu(passivoitu);
            henkilo.setDuplicate(duplikaatti);
            henkilo.setYksilointiYritetty(yksilointiYritetty);
            henkilo.setYksiloity(yksiloity);
            henkilo.setYksiloityVTJ(yksiloityVtj);
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
