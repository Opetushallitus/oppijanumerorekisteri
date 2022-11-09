package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSortFactory;
import fi.vm.sade.oppijanumerorekisteri.services.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;

import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.KAYTTOOIKEUS_OPPIJOIDENTUONTI;
import static fi.vm.sade.oppijanumerorekisteri.services.impl.PermissionCheckerImpl.PALVELU_OPPIJANUMEROREKISTERI;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

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
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;

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
    public OppijaTuontiPerustiedotReadDto create(OppijaTuontiCreateDto createDto) {
        // tallennetaan tuonti käsittelemättömänä kantaan
        OppijaTuontiPerustiedotReadDto readDto = oppijaTuontiService.create(createDto);
        // käynnistetään eräajon luonnin toinen vaihe toisessa säikeessä
        oppijaTuontiAsyncService.create(readDto.getId());

        return readDto;
    }

    @Override
    public OppijaTuontiPerustiedotReadDto getTuontiById(Long id) {
        Tuonti entity = getTuontiEntity(id);
        return mapper.map(entity, OppijaTuontiPerustiedotReadDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER)
    public OppijaTuontiPerustiedotReadDto create(Long id) {
        Tuonti entity = getTuontiEntity(id);
        oppijaTuontiAsyncService.create(entity.getId());
        return mapper.map(entity, OppijaTuontiPerustiedotReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public OppijaTuontiReadDto getOppijatByTuontiId(Long id) {
        Tuonti entity = getTuontiEntity(id);

        // ladataan rivit yhdellä haulla
        Set<String> organisaatioOids = oppijaTuontiService.getOrganisaatioOidsByKayttaja();
        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        criteria.setTuontiId(id);
        criteria.setOrganisaatioOids(organisaatioOids);
        List<TuontiRivi> rivit = tuontiRepository.findRiviBy(criteria, this.permissionChecker.isSuperUserOrCanReadAll());
        if (rivit.isEmpty()) {
            throw new ForbiddenException("Oppijoiden tuonnin tietoihin ei oikeuksia");
        }

        // rivit on jo ladattu valmiiksi joten tämä ei aiheuta kyselyä/rivi
        return mapper.map(entity, OppijaTuontiReadDto.class);
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
    public Page<OppijaListDto> list(OppijaTuontiCriteria criteria, int page, int count, OppijaTuontiSortKey sortKey, Sort.Direction sortDirection) {
        prepare(criteria);

        OppijaTuontiSort sort = OppijaTuontiSortFactory.getOppijaTuontiSort(sortDirection, sortKey);
        log.info("Haetaan oppijat {}, {} (sivu: {}, määrä: {})", criteria, sort, page, count);
        int limit = count;
        int offset = (page - 1) * count;
        List<Henkilo> henkilot = henkiloRepository.findBy(criteria, limit, offset, sort);
        long total = henkiloRepository.countBy(criteria);
        return Page.of(page, count, mapper.mapAsList(henkilot, OppijaListDto.class), total);
    }

    @Override
    public org.springframework.data.domain.Page<TuontiRepository.TuontiKooste> tuontiKooste(Pageable pagination) {
        final boolean isSuperUser = permissionChecker.isSuperUser();
        Set<String> userOrgs = isSuperUser ? Set.of() : resolveTuontiOrganisations();
        return tuontiRepository.getTuontiKooste(isSuperUser, userOrgs, pagination);
    }

    private Set<String> resolveTuontiOrganisations() {
        return permissionChecker.getOrganisaatioOids(PALVELU_OPPIJANUMEROREKISTERI, KAYTTOOIKEUS_OPPIJOIDENTUONTI).stream()
                .flatMap(organisaatioOid -> Stream.concat(Stream.of(organisaatioOid),
                        organisaatioService.getChildOids(organisaatioOid, true, OrganisaatioTilat.aktiivisetJaLakkautetut()).stream()))
                .collect(toSet());
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
            Set<String> organisaatioOidsByKayttaja = oppijaTuontiService.getOrganisaatioOidsByKayttaja().stream()
                    .flatMap(organisaatioOid -> Stream.concat(Stream.of(organisaatioOid), organisaatioService.getChildOids(organisaatioOid, true, OrganisaatioTilat.aktiivisetJaLakkautetut()).stream()))
                    .collect(toSet());
            if (organisaatioOidsByKayttaja.isEmpty()) {
                throw new ValidationException(String.format("Käyttäjällä %s ei ole yhtään organisaatiota joista oppijoita haetaan", kayttajaOid));
            }
            criteria.setOrRetainOrganisaatioOids(organisaatioOidsByKayttaja);
        }
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
