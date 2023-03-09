package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloCreateDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloExistenceCheckDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YleistunnisteDto;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloModificationService;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.YksilointiService;
import fi.vm.sade.oppijanumerorekisteri.services.YleistunnisteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class YleistunnisteServiceImpl implements YleistunnisteService {

    private final YksilointiService yksilointiService;

    private final HenkiloService henkiloService;

    private final HenkiloModificationService henkiloModificationService;

    @Override
    public YleistunnisteDto hae(HenkiloExistenceCheckDto details) {
        Optional<String> oid = yksilointiService.exists(details);
        return oid.isPresent() ? returnOnrDetails(oid.get()) : create(details);
    }

    private YleistunnisteDto returnOnrDetails(String oid) {
        return YleistunnisteDto.builder()
                .oid(oid)
                .oppijanumero(henkiloService.getMasterByOid(oid).getOppijanumero())
                .build();
    }

    private YleistunnisteDto create(HenkiloExistenceCheckDto details) {
        HenkiloDto henkilo = henkiloModificationService.createHenkilo(convert(details));
        return YleistunnisteDto.builder()
                .oid(henkilo.getOidHenkilo())
                .oppijanumero(henkilo.getOidHenkilo())
                .build();
    }

    private HenkiloCreateDto convert(HenkiloExistenceCheckDto details) {
        return HenkiloCreateDto.builder()
                .hetu(details.getHetu())
                .etunimet(details.getEtunimet())
                .kutsumanimi(details.getKutsumanimi())
                .sukunimi(details.getSukunimi())
                .build();
    }
}
