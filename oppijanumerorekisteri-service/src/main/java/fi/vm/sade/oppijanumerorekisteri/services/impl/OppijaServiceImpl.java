package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.DataInconsistencyException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.*;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSortFactory;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.*;
import static java.util.function.UnaryOperator.identity;
import static java.util.stream.Collectors.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private final OppijaTuontiService oppijaTuontiService;
    private final OppijaTuontiAsyncService oppijaTuontiAsyncService;
    private final HenkiloModificationService henkiloModificationService;
    private final OrganisaatioService organisaatioService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final HenkiloViiteRepository henkiloViiteRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;
    private final ObjectMapper objectMapper;

    org.springframework.data.domain.Sort oppijahakuSort = org.springframework.data.domain.Sort.by(Direction.ASC, "sukunimi", "etunimet", "syntymaaika");

    private Function<Henkilo, OppijahakuResult> mapToOppijahakuResult = new Function<Henkilo, OppijahakuResult>() {
        @Override
        public OppijahakuResult apply(Henkilo h) {
            return OppijahakuResult.builder()
                    .oid(h.getOidHenkilo())
                    .etunimet(h.getEtunimet())
                    .sukunimi(h.getSukunimi())
                    .syntymaaika(h.getSyntymaaika())
                    .build();
        }
    };

    @Override
    public String create(OppijaCreateDto dto) {
        Henkilo entity = mapper.map(dto, Henkilo.class);

        // lisätään oppija virkailijan organisaatioihin
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = oppijaTuontiService.getOrCreateOrganisaatioByKayttaja();
        organisaatiot.forEach(entity::addOrganisaatio);

        entity = henkiloModificationService.createHenkilo(entity, kayttajaOid, true);

        return entity.getOidHenkilo();
    }

    @Override
    @Transactional(propagation = Propagation.NEVER)
    public OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto createDto, TuontiApi api) {
        // tallennetaan tuonti käsittelemättömänä kantaan
        OppijaTuontiPerustiedotReadDto readDto = oppijaTuontiService.create(createDto, api);
        // käynnistetään eräajon luonnin toinen vaihe toisessa säikeessä
        oppijaTuontiAsyncService.create(readDto.getId(), api);

        return readDto;
    }

    @Override
    public OppijaTuontiPerustiedotReadDto getTuontiById(Long id) {
        Tuonti entity = getTuontiEntity(id);
        return mapper.map(entity, OppijaTuontiPerustiedotReadDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER)
    public OppijaTuontiPerustiedotReadDto create(Long id, TuontiApi api) {
        Tuonti entity = getTuontiEntity(id);
        oppijaTuontiAsyncService.create(entity.getId(), api);
        return mapper.map(entity, OppijaTuontiPerustiedotReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public OppijaTuontiReadDto getOppijatByTuontiId(Long id) {
        Tuonti entity = getTuontiEntity(id);

        // ladataan rivit yhdellä haulla
        getTuontiRivit(id);

        // rivit on jo ladattu valmiiksi joten tämä ei aiheuta kyselyä/rivi
        OppijaTuontiReadDto tuonti = mapper.map(entity, OppijaTuontiReadDto.class);

        decorateHenkilosWithMaster(resolveHenkilosFor(tuonti));
        decorateHenkilosWithLinkedOids(resolveHenkilosFor(tuonti));

        return tuonti;
    }

    private List<OppijaReadDto> resolveHenkilosFor(OppijaTuontiReadDto tuonti) {
        return tuonti.getHenkilot().stream().map(OppijaTuontiRiviReadDto::getHenkilo).collect(toList());
    }

    private Set<String> resolveOidsFor(List<OppijaReadDto> henkilos) {
        return henkilos.stream().map(OppijaReadDto::getOid).collect(toSet());
    }

    private void decorateHenkilosWithMaster(List<OppijaReadDto> henkilos) {
        final Map<String, String> masters = henkiloViiteRepository.getMasters(resolveOidsFor(henkilos))
                .stream().collect(toMap(HenkiloViiteRepository.Linked::getOid, HenkiloViiteRepository.Linked::getLinked));
        henkilos.stream()
                .filter(henkilo -> henkilo.getOppijanumero() == null)
                .forEach(henkilo -> henkilo.setOppijanumero(masters.get(henkilo.getOid())));
    }

    @Override
    public void decorateHenkilosWithLinkedOids(List<OppijaReadDto> henkilos) {
        final Map<String, Set<String>> linked = henkiloViiteRepository.getLinked(resolveOidsFor(henkilos))
                .stream().collect(groupingBy(HenkiloViiteRepository.Linked::getOid, mapping(HenkiloViiteRepository.Linked::getLinked, toSet())));
        henkilos.forEach(henkilo -> henkilo.setLinked(linked.getOrDefault(henkilo.getOid(), Set.of())));
    }

    private List<TuontiRivi> getTuontiRivit(final long tuontiId) {
        Set<String> organisaatioOids = permissionChecker.getOrganisaatioOidsByKayttaja(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT_LITERAL, KAYTTOOIKEUS_TUONTIDATA_READ);
        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        criteria.setTuontiId(tuontiId);
        criteria.setOrganisaatioOids(organisaatioOids);
        List<TuontiRivi> rivit = tuontiRepository.findRiviBy(criteria, this.permissionChecker.isSuperUserOrCanReadAll());
        if (rivit.isEmpty()) {
            throw new ForbiddenException("Oppijoiden tuonnin tietoihin ei oikeuksia");
        }
        return rivit;
    }

    @Override
    @Transactional(readOnly = true)
    public OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria) {
        prepare(criteria);
        log.info("Haetaan oppijoiden tuonnin yhteenveto {}", criteria);
        OppijaTuontiYhteenvetoDto dto = new OppijaTuontiYhteenvetoDto();
        dto.setOnnistuneet(henkiloRepository.countByYksilointiOnnistuneet(criteria));
        dto.setVirheet(henkiloRepository.countByYksilointiVirheet(criteria));
        dto.setKeskeneraiset(henkiloRepository.countByYksilointiKeskeneraiset(criteria));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OppijaListDto> oppijoidenTuontienVirheet(OppijaTuontiCriteria criteria, int page, int count) {
        criteria.setVainVirheet(true);
        prepare(criteria);

        log.info("Haetaan oppijat {}, (sivu: {}, määrä: {})", criteria, page, count);
        int limit = count;
        int offset = (page - 1) * count;
        List<Henkilo> henkilot = henkiloRepository.findOppijoidenTuontiVirheetBy(criteria, limit, offset);
        long total = henkiloRepository.countOppijoidenTuontiVirheetBy(criteria);
        return Page.of(page, count, mapper.mapAsList(henkilot, OppijaListDto.class), total);
    }

    @Override
    public org.springframework.data.domain.Page<TuontiRepository.TuontiKooste> tuontiKooste(Pageable pagination, Long id, String author) {
        final boolean isSuperUser = permissionChecker.isSuperUserOrCanReadAll();
        Set<String> userOrgs = isSuperUser ? Set.of() : permissionChecker.getAllOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, KAYTTOOIKEUS_TUONTIDATA_READ);
        return tuontiRepository.getTuontiKooste(isSuperUser, userOrgs, id, author, pagination);
    }

    @Override
    public List<OppijaTuontiRiviCreateDto> tuontiData(long tuontiId) {
        Tuonti tuonti = getTuonti(tuontiId);
        Map<String, TuontiRivi> tuontiRivit = getTuontiRivit(tuontiId).stream().collect(toMap(TuontiRivi::getTunniste, identity(), (found, duplicate) -> found));
        OppijaTuontiCreateDto tuontiData = resolveTuontiData(tuonti.getData().getData());
        tuontiData.getHenkilot().forEach(riviData -> {
            Optional<TuontiRivi> tuontiRivi = Optional.ofNullable(tuontiRivit.get(riviData.getTunniste()));
            if (tuontiRivi.isPresent()) {
                riviData.setHenkiloOid(tuontiRivi.get().getHenkilo().getOidHenkilo());
                riviData.setHenkiloNimi(getNimiForHenkilo(tuontiRivi.get().getHenkilo()));
                riviData.setConflict(Optional.ofNullable(tuontiRivi.get().getConflict()).orElse(false));
            }
        });
        return tuontiData.getHenkilot();
    }

    private Tuonti getTuonti(long tuontiId) {
        Tuonti tuonti = tuontiRepository.findById(tuontiId).orElseThrow(() -> new NotFoundException("tuntematon tuonti"));
        if ( permissionChecker.isSuperUserOrCanReadAll() || canRead(tuonti) ) {
            return tuonti;
        }
        throw new ForbiddenException("ei lukuoikeutta");
    }

    private boolean canRead(Tuonti tuonti) {
        Set<String> grantedOrgs = permissionChecker.getAllOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_TUONTIDATA_READ);
        Set<String> tuontiOrgs = tuonti.getOrganisaatiot().stream().map(org -> org.getOid()).collect(toSet());
        tuontiOrgs.retainAll(grantedOrgs);
        return !tuontiOrgs.isEmpty();
    }

    private OppijaTuontiCreateDto resolveTuontiData(final byte[] bytes) {
        try {
            return objectMapper.readValue(new String(bytes, StandardCharsets.UTF_8), OppijaTuontiCreateDto.class);
        } catch (JsonProcessingException jpe) {
            throw new DataInconsistencyException("Could not deserialize tuonti data", jpe);
        }
    }

    private String getNimiForHenkilo(Henkilo henkilo) {
        return Stream.of(henkilo.getSukunimi(), henkilo.getEtunimet()).collect(joining(", "));
    }

    @Override
    public Page<MasterHenkiloDto<OppijaReadDto>> listMastersBy(OppijaTuontiCriteria criteria, int page, int count) {
        // haetaan henkilöt
        prepare(criteria);

        OppijaTuontiSort sort = OppijaTuontiSortFactory.getOppijaTuontiSort(Sort.Direction.ASC, OppijaTuontiSortKey.MODIFIED);
        log.info("Haetaan oppijat {}, {} (sivu: {}, määrä: {})", criteria, sort, page, count);
        int limit = count;
        int offset = (page - 1) * count;
        List<Henkilo> slaves = henkiloRepository.findBy(criteria, limit, offset, sort);
        long total = henkiloRepository.countBy(criteria);

        // haetaan henkilöille masterit
        Set<String> slaveOids = slaves.stream().map(Henkilo::getOidHenkilo).collect(toSet());
        Map<String, Henkilo> mastersBySlaveOid = henkiloRepository.findMastersBySlaveOids(slaveOids);

        // palautetaan henkilöiden tiedot mastereista
        HenkiloToMasterDto toMasterDto = new HenkiloToMasterDto(mastersBySlaveOid, mapper);
        List<MasterHenkiloDto<OppijaReadDto>> masters = slaves.stream().map(toMasterDto).collect(toList());
        return Page.of(page, count, masters, total);
    }

    @Override
    public void addKayttajanOrganisaatiot(String henkiloOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = oppijaTuontiService.getOrCreateOrganisaatioByKayttaja();
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Henkilöllä %s ei ole yhtään organisaatiota joihin oppija liitetään", kayttajaOid));
        }
        organisaatiot.forEach(henkilo::addOrganisaatio);
        henkiloModificationService.update(henkilo);
    }

    @Override
    public void addOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        Organisaatio organisaatio = organisaatioRepository.findByOid(organisaatioOid)
                .orElseGet(() -> organisaatioService.create(organisaatioOid));
        if (henkilo.addOrganisaatio(organisaatio)) {
            henkiloModificationService.update(henkilo);
        }
    }

    @Override
    public void deleteOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        organisaatioRepository.findByOid(organisaatioOid).ifPresent(organisaatio -> {
            if (henkilo.removeOrganisaatio(organisaatio)) {
                henkiloModificationService.update(henkilo);
            }
        });
    }

    private Tuonti getTuontiEntity(Long id) {
        return tuontiRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.format("Oppijoiden tuontia ei löytynyt ID:llä %s", id)));
    }

    private Henkilo getHenkiloEntity(String henkiloOid) {
        return henkiloRepository.findByOidHenkilo(henkiloOid)
                .orElseThrow(() -> new NotFoundException(String.format("Henkilöä ei löytynyt OID:lla %s", henkiloOid)));
    }

    private void prepare(OppijaTuontiCriteria criteria) {
        // rekisterinpitäjä ja rekisterinpitaja read saa hakea kaikista organisaatioista oppijoita,
        // muut käyttäjät ainoastaan omista organisaatioista
        if (!permissionChecker.isSuperUserOrCanReadAll()) {
            String kayttajaOid = userDetailsHelper.getCurrentUserOid();
            Set<String> organisaatioOidsByKayttaja = permissionChecker.getAllOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI, YLEISTUNNISTE_LUONTI_ACCESS_RIGHT, KAYTTOOIKEUS_TUONTIDATA_READ);
            if (organisaatioOidsByKayttaja.isEmpty()) {
                throw new ValidationException(String.format("Käyttäjällä %s ei ole yhtään organisaatiota joista oppijoita haetaan", kayttajaOid));
            }
            criteria.setOrRetainOrganisaatioOids(organisaatioOidsByKayttaja);
        }
    }

    @Override
    public org.springframework.data.domain.Page<OppijahakuResult> oppijahaku(OppijahakuCriteria criteria) {
        if (criteria.getQuery().trim().startsWith("1.2.")) {
            return criteria.isPassive()
                ? henkiloRepository.findAllByOidHenkilo(
                        criteria.getQuery().trim(),
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort)
                    ).map(mapToOppijahakuResult)
                : henkiloRepository.findAllByOidHenkiloAndPassivoituFalse(
                        criteria.getQuery().trim(),
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort)
                    ).map(mapToOppijahakuResult);
        } else if (criteria.getQuery().trim().matches("\\d{6}.\\d{3}[\\dA-Z]")) {
            return criteria.isPassive()
                ? henkiloRepository.findAllByHetu(
                        criteria.getQuery().trim(),
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort)
                    ).map(mapToOppijahakuResult)
                : henkiloRepository.findAllByHetuAndPassivoituFalse(
                        criteria.getQuery().trim(),
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort)
                    ).map(mapToOppijahakuResult);
        } else {
            return oppijahakuByNames(criteria).map(mapToOppijahakuResult);
        }
    }

    private org.springframework.data.domain.Page<Henkilo> oppijahakuByNames(OppijahakuCriteria criteria) {
        if (criteria.getQuery().contains(",")) {
            // search by henkilo-ui presentation i.e. "Lastname, Firstname (Middlename)"
            String etunimet = criteria.getQuery().substring(criteria.getQuery().indexOf(",") + 1).trim();
            String sukunimi = criteria.getQuery().split(",")[0].trim();
            return criteria.isPassive()
                ? henkiloRepository.findAllByFullNameOppijahakuQuery(
                        etunimet,
                        sukunimi,
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort))
                : henkiloRepository.findAllNotPassivoituByFullNameOppijahakuQuery(
                        etunimet,
                        sukunimi,
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort));
        } else if (criteria.getQuery().contains(" ")) {
            // search by typical Finnish name presentation i.e. "Firstname (Middlename) Lastname"
            String etunimet = criteria.getQuery().substring(0, criteria.getQuery().lastIndexOf(" ") + 1).trim();
            String sukunimi = criteria.getQuery().substring(criteria.getQuery().lastIndexOf(" ") + 1).trim();
            return criteria.isPassive()
                ? henkiloRepository.findAllByFullNameOppijahakuQuery(
                        etunimet,
                        sukunimi,
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort))
                : henkiloRepository.findAllNotPassivoituByFullNameOppijahakuQuery(
                        etunimet,
                        sukunimi,
                        PageRequest.of(criteria.getPage(), 50, oppijahakuSort));
        }

        return criteria.isPassive()
            ? henkiloRepository.findAllByOppijahakuQuery(
                    criteria.getQuery(),
                    PageRequest.of(criteria.getPage(), 50, oppijahakuSort))
            : henkiloRepository.findAllNotPassivoituByOppijahakuQuery(
                    criteria.getQuery(),
                    PageRequest.of(criteria.getPage(), 50, oppijahakuSort));
    }

    @RequiredArgsConstructor
    private static class HenkiloToMasterDto implements Function<Henkilo, MasterHenkiloDto<OppijaReadDto>> {

        private final Map<String, Henkilo> mastersBySlaveOid;
        private final OrikaConfiguration mapper;

        @Override
        public MasterHenkiloDto<OppijaReadDto> apply(Henkilo slave) {
            MasterHenkiloDto<OppijaReadDto> dto = new MasterHenkiloDto<>();
            String slaveOid = slave.getOidHenkilo();
            dto.setOid(slaveOid);
            Henkilo master = mastersBySlaveOid.getOrDefault(slaveOid, slave);
            dto.setMaster(mapper.map(master, OppijaReadDto.class));
            return dto;
        }

    }

}
