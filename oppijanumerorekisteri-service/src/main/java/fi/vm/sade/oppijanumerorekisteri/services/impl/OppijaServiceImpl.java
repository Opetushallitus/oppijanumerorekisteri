package fi.vm.sade.oppijanumerorekisteri.services.impl;

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
import fi.vm.sade.oppijanumerorekisteri.models.Organisaatio;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
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
import fi.vm.sade.oppijanumerorekisteri.services.OrganisaatioService;

@Service
@Transactional
@RequiredArgsConstructor
public class OppijaServiceImpl implements OppijaService {

    private final OrganisaatioService organisaatioService;
    private final HenkiloService henkiloService;
    private final OrikaConfiguration mapper;
    private final HenkiloRepository henkiloRepository;
    private final TuontiRepository tuontiRepository;

    @Override
    public OppijatReadDto getOrCreate(OppijatCreateDto dto) {
        Organisaatio organisaatio = organisaatioService
                .getByOid(dto.getOrganisaatioOid())
                .orElseGet(() -> organisaatioService.create(dto.getOrganisaatioOid()));

        // validoidaan että hetut ovat uniikkeja
        Map<String, OppijaCreateDto> oppijatByHetu = dto.getHenkilot().stream()
                .collect(toMap(t -> t.getHenkilo().getHetu(), identity(), (u, v) -> {
                    throw new ValidationException(String.format("Duplikaatti hetu %s", u.getHenkilo().getHetu()));
                }));
        // haetaan jo luodut henkilöt
        Map<String, Henkilo> henkilot = henkiloRepository
                .findByHetuIn(oppijatByHetu.keySet()).stream()
                .collect(toMap(henkilo -> henkilo.getHetu(), identity()));

        Tuonti tuonti = mapper.map(dto, Tuonti.class);
        tuonti.setHenkilot(dto.getHenkilot().stream()
                .map(oppija -> getOrCreate(oppija, henkilot.get(oppija.getHenkilo().getHetu()), organisaatio))
                .collect(toSet()));
        tuonti = tuontiRepository.save(tuonti);
        return mapper.map(tuonti, OppijatReadDto.class);
    }

    private TuontiRivi getOrCreate(OppijaCreateDto oppija, Henkilo henkilo, Organisaatio organisaatio) {
        // luodaan tarvittaessa uusi henkilö
        if (henkilo == null) {
            henkilo = mapper.map(oppija.getHenkilo(), Henkilo.class);
            henkilo.setHenkiloTyyppi(HenkiloTyyppi.OPPIJA);
            henkilo = henkiloService.createHenkilo(henkilo);
        }

        // liitetään henkilö organisaatioon
        henkilo.addOrganisaatio(organisaatio);

        TuontiRivi rivi = mapper.map(oppija, TuontiRivi.class);
        rivi.setHenkilo(henkilo);
        return rivi;
    }

    @Override
    @Transactional(readOnly = true)
    public OppijatReadDto getByTuontiId(Long id) {
        return tuontiRepository.findById(id)
                .map(entity -> mapper.map(entity, OppijatReadDto.class))
                .orElseThrow(() -> new NotFoundException("Oppijoiden tuontia ei löytynyt ID:llä " + id));
    }

}
