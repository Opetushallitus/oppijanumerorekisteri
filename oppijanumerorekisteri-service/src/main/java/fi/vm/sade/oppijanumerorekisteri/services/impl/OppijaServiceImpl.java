package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.clients.KayttooikeusClient;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaMuutosDto;
import fi.vm.sade.oppijanumerorekisteri.dto.MasterHenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloTyyppi;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiYhteenvetoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.OppijatReadDto;
import fi.vm.sade.oppijanumerorekisteri.dto.Page;
import fi.vm.sade.oppijanumerorekisteri.dto.TuontiReadDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ForbiddenException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.exceptions.ValidationException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.models.Tuonti;
import fi.vm.sade.oppijanumerorekisteri.models.TuontiRivi;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloJpaRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.OrganisaatioRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.OppijaTuontiCriteria;
import fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort;
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;
import fi.vm.sade.oppijanumerorekisteri.services.PermissionChecker;
import fi.vm.sade.oppijanumerorekisteri.services.UserDetailsHelper;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Propagation;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiAsyncService;
import java.util.Map;
import java.util.function.Function;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OppijaServiceImpl.class);

    private final OppijaTuontiService oppijaTuontiService;
    private final OppijaTuontiAsyncService oppijaTuontiAsyncService;
    private final HenkiloService henkiloService;
    private final OrganisaatioService organisaatioService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final HenkiloJpaRepository henkiloJpaRepository;
    private final TuontiRepository tuontiRepository;
    private final OrganisaatioRepository organisaatioRepository;
    private final UserDetailsHelper userDetailsHelper;
    private final PermissionChecker permissionChecker;
    private final KayttooikeusClient kayttooikeusClient;

    @Override
    public HenkiloReadDto create(HenkiloCreateDto dto) {
        Henkilo entity = mapper.map(dto, Henkilo.class);
        entity.setHenkiloTyyppi(HenkiloTyyppi.OPPIJA);
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = oppijaTuontiService
                .getOrCreateOrganisaatioByHenkilo(kayttajaOid);
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Henkilöllä %s ei ole yhtään organisaatiota joihin oppija liitetään", kayttajaOid));
        }
        organisaatiot.stream().forEach(entity::addOrganisaatio);
        entity = henkiloService.createHenkilo(entity, kayttajaOid, true);
        return mapper.map(entity, HenkiloReadDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER)
    public TuontiReadDto create(OppijatCreateDto createDto) {
        // tallennetaan tuonti käsittelemättömänä kantaan
        TuontiReadDto readDto = oppijaTuontiService.create(createDto);
        // käynnistetään eräajon luonnin toinen vaihe toisessa säikeessä
        oppijaTuontiAsyncService.create(readDto.getId());

        return readDto;
    }

    @Override
    public TuontiReadDto getTuontiById(Long id) {
        Tuonti entity = getTuontiEntity(id);
        return mapper.map(entity, TuontiReadDto.class);
    }

    @Override
    @Transactional(propagation = Propagation.NEVER)
    public TuontiReadDto create(Long id) {
        Tuonti entity = getTuontiEntity(id);
        oppijaTuontiAsyncService.create(entity.getId());
        return mapper.map(entity, TuontiReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public OppijatReadDto getOppijatByTuontiId(Long id) {
        Tuonti entity = getTuontiEntity(id);

        // ladataan rivit yhdellä haulla
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<String> organisaatioOids = kayttooikeusClient
                .getAktiivisetOrganisaatioHenkilot(kayttajaOid);
        OppijaTuontiCriteria criteria = new OppijaTuontiCriteria();
        criteria.setTuontiId(id);
        criteria.setOrganisaatioOids(organisaatioOids);
        List<TuontiRivi> rivit = tuontiRepository.findRiviBy(criteria);
        if (rivit.isEmpty()) {
            throw new ForbiddenException("Oppijoiden tuonnin tietoihin ei oikeuksia");
        }

        // rivit on jo ladattu valmiiksi joten tämä ei aiheuta kyselyä/rivi
        return mapper.map(entity, OppijatReadDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public OppijaTuontiYhteenvetoDto getYhteenveto(OppijaTuontiCriteria criteria) {
        prepare(criteria);
        LOGGER.info("Haetaan oppijoiden tuonnin yhteenveto {}", criteria);
        OppijaTuontiYhteenvetoDto dto = new OppijaTuontiYhteenvetoDto();
        dto.setOnnistuneet(henkiloJpaRepository.countByYksilointiOnnistuneet(criteria));
        dto.setVirheet(henkiloJpaRepository.countByYksilointiVirheet(criteria));
        dto.setKeskeneraiset(henkiloJpaRepository.countByYksilointiKeskeneraiset(criteria));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OppijaReadDto.OppijaReadHenkiloDto> list(OppijaTuontiCriteria criteria, int page, int count) {
        prepare(criteria);
        OppijaTuontiSort sort = new OppijaTuontiSort(Sort.Direction.ASC,
                OppijaTuontiSort.Column.MODIFIED, OppijaTuontiSort.Column.ID);
        LOGGER.info("Haetaan oppijat {}, {} (sivu: {}, määrä: {})", criteria, sort, page, count);
        int limit = count;
        int offset = (page - 1) * count;
        List<Henkilo> henkilot = henkiloJpaRepository.findBy(criteria, limit, offset, sort);
        long total = henkiloJpaRepository.countBy(criteria);
        return Page.of(page, count, mapper.mapAsList(henkilot, OppijaReadDto.OppijaReadHenkiloDto.class), total);
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<String> listOidsBy(OppijaTuontiCriteria criteria) {
        prepare(criteria);
        LOGGER.info("Haetaan oppijoiden OID:t {}", criteria);
        return henkiloJpaRepository.findOidsBy(criteria);
    }

    @Override
    public Page<MasterHenkiloDto<OppijaMuutosDto>> listMastersBy(OppijaTuontiCriteria criteria, int page, int count) {
        // haetaan henkilöt
        prepare(criteria);
        OppijaTuontiSort sort = new OppijaTuontiSort(Sort.Direction.ASC,
                OppijaTuontiSort.Column.MODIFIED, OppijaTuontiSort.Column.ID);
        LOGGER.info("Haetaan oppijat {}, {} (sivu: {}, määrä: {})", criteria, sort, page, count);
        int limit = count;
        int offset = (page - 1) * count;
        List<Henkilo> slaves = henkiloJpaRepository.findBy(criteria, limit, offset, sort);
        long total = henkiloJpaRepository.countBy(criteria);

        // haetaan henkilöille masterit
        Set<String> slaveOids = slaves.stream().map(Henkilo::getOidHenkilo).collect(toSet());
        Map<String, Henkilo> mastersBySlaveOid = henkiloJpaRepository.findMastersBySlaveOids(slaveOids);

        // palautetaan henkilöiden tiedot mastereista
        HenkiloToMasterDto toMasterDto = new HenkiloToMasterDto(mastersBySlaveOid, mapper);
        List<MasterHenkiloDto<OppijaMuutosDto>> masters = slaves.stream().map(toMasterDto).collect(toList());
        return Page.of(page, count, masters, total);
    }

    @RequiredArgsConstructor
    private static class HenkiloToMasterDto implements Function<Henkilo, MasterHenkiloDto<OppijaMuutosDto>> {

        private final Map<String, Henkilo> mastersBySlaveOid;
        private final OrikaConfiguration mapper;

        @Override
        public MasterHenkiloDto<OppijaMuutosDto> apply(Henkilo slave) {
            MasterHenkiloDto<OppijaMuutosDto> dto = new MasterHenkiloDto<>();
            String slaveOid = slave.getOidHenkilo();
            dto.setOid(slaveOid);
            Henkilo master = mastersBySlaveOid.getOrDefault(slaveOid, slave);
            dto.setMaster(mapper.map(master, OppijaMuutosDto.class));
            return dto;
        }

    }

    @Override
    public void addKayttajanOrganisaatiot(String henkiloOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        String kayttajaOid = userDetailsHelper.getCurrentUserOid();
        Set<Organisaatio> organisaatiot = oppijaTuontiService
                .getOrCreateOrganisaatioByHenkilo(kayttajaOid);
        if (organisaatiot.isEmpty()) {
            throw new ValidationException(String.format("Henkilöllä %s ei ole yhtään organisaatiota joihin oppija liitetään", kayttajaOid));
        }
        organisaatiot.stream().forEach(henkilo::addOrganisaatio);
        henkiloService.update(henkilo);
    }

    @Override
    public void addOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        Organisaatio organisaatio = organisaatioRepository.findByOid(organisaatioOid)
                .orElseGet(() -> organisaatioService.create(organisaatioOid));
        if (henkilo.addOrganisaatio(organisaatio)) {
            henkiloService.update(henkilo);
        }
    }

    @Override
    public void deleteOrganisaatio(String henkiloOid, String organisaatioOid) {
        Henkilo henkilo = getHenkiloEntity(henkiloOid);
        organisaatioRepository.findByOid(organisaatioOid).ifPresent(organisaatio -> {
            if (henkilo.removeOrganisaatio(organisaatio)) {
                henkiloService.update(henkilo);
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
        // rekisterinpitäjä saa hakea kaikista organisaatioista oppijoita,
        // muut käyttäjät ainoastaan omista organisaatioista
        if (!permissionChecker.isSuperUser()) {
            String kayttajaOid = userDetailsHelper.getCurrentUserOid();
            Set<String> organisaatioOidsByKayttaja = kayttooikeusClient
                    .getAktiivisetOrganisaatioHenkilot(kayttajaOid);
            if (organisaatioOidsByKayttaja.isEmpty()) {
                throw new ValidationException(String.format("Käyttäjällä %s ei ole yhtään organisaatiota joista oppijoita haetaan", kayttajaOid));
            }
            criteria.setOrRetainOrganisaatioOids(organisaatioOidsByKayttaja);
        }
    }

}
