package fi.vm.sade.oppijanumerorekisteri.services.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.IdentificationDto;
import fi.vm.sade.oppijanumerorekisteri.exceptions.NotFoundException;
import fi.vm.sade.oppijanumerorekisteri.mappers.OrikaConfiguration;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Identification;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.IdentificationRepository;
import fi.vm.sade.oppijanumerorekisteri.services.IdentificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class IdentificationServiceImpl implements IdentificationService {

    private final IdentificationRepository identificationRepository;
    private final HenkiloRepository henkiloRepository;
    private final OrikaConfiguration mapper;

    public IdentificationServiceImpl(IdentificationRepository identificationRepository,
            HenkiloRepository henkiloRepository,
            OrikaConfiguration mapper) {
        this.identificationRepository = identificationRepository;
        this.henkiloRepository = henkiloRepository;
        this.mapper = mapper;
    }

    private Henkilo getHenkiloByOid(String oid) {
        return henkiloRepository.findByOidHenkilo(oid).orElseThrow(()
                -> new NotFoundException("Henkilöä ei löytynyt OID:lla " + oid));
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<IdentificationDto> listByHenkiloOid(String oid) {
        Henkilo henkilo = getHenkiloByOid(oid);
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    @Override
    @Transactional(readOnly = false)
    public Iterable<IdentificationDto> create(String oid, IdentificationDto dto) {
        Identification entity = identificationRepository.findByIdpEntityIdAndIdentifier(dto.getIdpEntityId(), dto.getIdentifier())
                .orElseGet(() -> save(oid, dto));

        Henkilo henkilo = entity.getHenkilo();
        return mapper.mapAsList(henkilo.getIdentifications(), IdentificationDto.class);
    }

    private Identification save(String oid, IdentificationDto dto) {
        Henkilo henkilo = getHenkiloByOid(oid);
        Identification identification = mapper.map(dto, Identification.class);
        identification.setHenkilo(henkilo);
        henkilo.getIdentifications().add(identification);
        return identificationRepository.save(identification);
    }

}
