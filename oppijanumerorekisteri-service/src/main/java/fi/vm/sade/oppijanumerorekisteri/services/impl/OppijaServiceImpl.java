package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.kayttooikeus.dto.OrganisaatioHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import static fi.vm.sade.oppijanumerorekisteri.models.Identification.SAHKOPOSTI_IDP_ENTITY_ID;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import java.util.Map;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.Collection;
import java.util.Date;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OppijaServiceImpl.class);

    private final HenkiloService henkiloService;
    private final OrganisaatioService organisaatioService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final KayttooikeusClient kayttooikeusClient;

    @Override
    public OppijatReadDto getOrCreate(OppijatCreateDto dto) {
        Collection<OppijaCreateDto> henkilot = dto.getHenkilot();

        // validoidaan että oidit, hetut, passinumerot ja sähköpostit ovat uniikkeja
        Map<String, OppijaCreateDto> oppijatByOid = mapByOppijaProperty(henkilot,
                OppijaCreateDto.HenkiloCreateDto::getOid, "OID");
        Map<String, OppijaCreateDto> oppijatByHetu = mapByOppijaProperty(henkilot,
                OppijaCreateDto.HenkiloCreateDto::getHetu, "hetu");
        Map<String, OppijaCreateDto> oppijatByPassinumero = mapByOppijaProperty(henkilot,
                OppijaCreateDto.HenkiloCreateDto::getPassinumero, "passinumero");
        Map<String, OppijaCreateDto> oppijatBySahkoposti = mapByOppijaProperty(henkilot,
                OppijaCreateDto.HenkiloCreateDto::getSahkoposti, "sähköposti");

        // haetaan käyttäjän organisaatiot (joihin oppijat liitetään)
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = getOrCreateOrganisaatioByHenkilo(kayttajaOid);
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Käyttäjällä (%s) ei ole yhtään organisaatiota joihin oppijat liitetään", kayttajaOid));
        }
        // haetaan jo luodut henkilöt
        Map<String, Henkilo> henkilotByOid = getAndMapByOid(oppijatByOid.keySet());
        Map<String, Henkilo> henkilotByHetu = getAndMapByHetu(oppijatByHetu.keySet());
        Map<String, Henkilo> henkilotByPassinumero = getAndMapByPassinumero(oppijatByPassinumero.keySet());
        Map<String, Henkilo> henkilotBySahkoposti = getAndMapBySahkoposti(oppijatBySahkoposti.keySet());

        Tuonti tuonti = mapper.map(dto, Tuonti.class);
        TuontiRiviHelper tuontiRiviHelper = new TuontiRiviHelper(organisaatiot, henkilotByOid, henkilotByHetu, henkilotByPassinumero, henkilotBySahkoposti);
        tuonti.setHenkilot(henkilot.stream()
                .map(tuontiRiviHelper::map)
                .collect(toSet()));
        tuonti = tuontiRepository.save(tuonti);
        return mapper.map(tuonti, OppijatReadDto.class);
    }

    private <T> Map<T, OppijaCreateDto> mapByOppijaProperty(Collection<OppijaCreateDto> oppijat, Function<OppijaCreateDto.HenkiloCreateDto, T> mapper, String name) {
        return oppijat.stream()
                .filter(oppija -> mapper.apply(oppija.getHenkilo()) != null)
                .collect(toMap(oppija -> mapper.apply(oppija.getHenkilo()), identity(), (oppija1, oppija2) -> {
                    throw new ValidationException(String.format("Duplikaatti %s %s", name, mapper.apply(oppija1.getHenkilo())));
                }));
    }

    private Set<Organisaatio> getOrCreateOrganisaatioByHenkilo(String henkiloOid) {
        // haetaan henkilön organisaatiot ja luodaan niistä organisaatio oppijanumerorekisteriin
        return kayttooikeusClient.getOrganisaatioHenkilot(henkiloOid).stream()
                .filter(organisaatioHenkilo -> !organisaatioHenkilo.isPassivoitu())
                .map(organisaatio -> organisaatioRepository.findByOid(organisaatio.getOrganisaatioOid())
                        .orElseGet(() -> organisaatioRepository.save(Organisaatio.builder().oid(organisaatio.getOrganisaatioOid()).build())))
                .collect(toSet());
    }

    private Map<String, Henkilo> getAndMapByOid(Set<String> oids) {
        return henkiloRepository
                .findByOidHenkiloIsIn(oids).stream()
                .collect(toMap(henkilo -> henkilo.getOidHenkilo(), identity()));
    }

    private Map<String, Henkilo> getAndMapByHetu(Set<String> hetut) {
        return henkiloRepository
                .findByHetuIn(hetut).stream()
                .collect(toMap(henkilo -> henkilo.getHetu(), identity()));
    }

    private Map<String, Henkilo> getAndMapByPassinumero(Set<String> passinumerot) {
        return henkiloJpaRepository.findAndMapByPassinumerot(passinumerot);
    }

    private Map<String, Henkilo> getAndMapBySahkoposti(Set<String> sahkopostit) {
        return henkiloJpaRepository.findAndMapByIdentifiers(SAHKOPOSTI_IDP_ENTITY_ID, sahkopostit);
    }

    @RequiredArgsConstructor
    private class TuontiRiviHelper {

        private final Set<Organisaatio> organisaatiot;
        private final Map<String, Henkilo> henkilotByOid;
        private final Map<String, Henkilo> henkilotByHetu;
        private final Map<String, Henkilo> henkilotByPassinumero;
        private final Map<String, Henkilo> henkilotBySahkoposti;

        public TuontiRivi map(OppijaCreateDto oppija) {
            Henkilo henkiloByOid = henkilotByOid.get(oppija.getHenkilo().getOid());
            Henkilo henkiloByHetu = henkilotByHetu.get(oppija.getHenkilo().getHetu());
            Henkilo henkiloByPassinumero = henkilotByPassinumero.get(oppija.getHenkilo().getPassinumero());
            Henkilo henkiloBySahkoposti = henkilotBySahkoposti.get(oppija.getHenkilo().getSahkoposti());

            Henkilo henkilo = Stream.of(henkiloByOid, henkiloByHetu, henkiloByPassinumero, henkiloBySahkoposti)
                    .filter(Objects::nonNull)
                    .findFirst().orElseGet(() -> newHenkilo(oppija));

            // liitetään henkilö organisaatioihin
            organisaatiot.stream().forEach(henkilo::addOrganisaatio);
            henkilo = henkiloRepository.save(henkilo);

            TuontiRivi rivi = mapper.map(oppija, TuontiRivi.class);
            rivi.setHenkilo(henkilo);
            return rivi;
        }

        private Henkilo newHenkilo(OppijaCreateDto oppija) {
            Henkilo henkilo = mapper.map(oppija.getHenkilo(), Henkilo.class);
            henkilo.setHenkiloTyyppi(HenkiloTyyppi.OPPIJA);
            if (oppija.getHenkilo().getPassinumero() != null) {
                henkilo.setPassinumerot(Stream.of(oppija.getHenkilo().getPassinumero()).collect(toSet()));
            }
            if (oppija.getHenkilo().getSahkoposti() != null) {
                henkilo.setIdentifications(Stream.of(Identification.builder()
                        .idpEntityId(SAHKOPOSTI_IDP_ENTITY_ID)
                        .identifier(oppija.getHenkilo().getSahkoposti())
                        .build()).collect(toSet())
                );
            }
            return henkiloService.createHenkilo(henkilo);
        }

    }

    @Override
    @Transactional(readOnly = true)
    public OppijatReadDto getByTuontiId(Long id) {
        return tuontiRepository.findById(id)
                .map(entity -> mapper.map(entity, OppijatReadDto.class))
                .orElseThrow(() -> new NotFoundException("Oppijoiden tuontia ei löytynyt ID:llä " + id));
    }

    @Override
    public Iterable<String> listOidsBy(OppijaTuontiCriteria criteria) {
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<String> organisaatioOids = kayttooikeusClient.getOrganisaatioHenkilot(kayttajaOid)
                .stream()
                .filter(organisaatioHenkilo -> !organisaatioHenkilo.isPassivoitu())
                .map(OrganisaatioHenkiloDto::getOrganisaatioOid)
                .collect(toSet());
        if (organisaatioOids.isEmpty()) {
            throw new ValidationException(String.format("Käyttäjällä (%s) ei ole yhtään organisaatiota joista oppijoita haetaan", kayttajaOid));
        }

        criteria.setOrRetainOrganisaatioOids(organisaatioOids);
        LOGGER.info("Haetaan oppijat {}", criteria);
        return henkiloJpaRepository.findOidsBy(criteria);
    }

    @Override
    public void addOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getOppija(henkiloOid);
        Organisaatio organisaatio = organisaatioRepository.findByOid(organisaatioOid)
                .orElseGet(() -> organisaatioService.create(organisaatioOid));
        if (henkilo.addOrganisaatio(organisaatio)) {
            henkilo.setModified(new Date());
            henkilo.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());
            henkiloRepository.save(henkilo);
        }
    }

    @Override
    public void deleteOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getOppija(henkiloOid);
        organisaatioRepository.findByOid(organisaatioOid).ifPresent(organisaatio -> {
            if (henkilo.removeOrganisaatio(organisaatio)) {
                henkilo.setModified(new Date());
                henkilo.setKasittelijaOid(userDetailsHelper.getCurrentUserOid());
                henkiloRepository.save(henkilo);
            }
        });
    }

    private Henkilo getOppija(String henkiloOid) {
        Henkilo henkilo = henkiloRepository.findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException(String.format("Henkilöä ei löytynyt OID:lla %s", henkiloOid)));
        if (!HenkiloTyyppi.OPPIJA.equals(henkilo.getHenkiloTyyppi())) {
            throw new ValidationException(String.format("Henkilö %s ei ole oppija", henkiloOid));
        }
        return henkilo;
    }

}