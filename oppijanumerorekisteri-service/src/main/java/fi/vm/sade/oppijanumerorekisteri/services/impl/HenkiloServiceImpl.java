package fi.vm.sade.oppijanumerorekisteri.services.impl;

import com.querydsl.core.types.Predicate;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloPerustietoDto;
import fi.vm.sade.oppijanumerorekisteri.dto.HenkilonYhteystiedotViewDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystiedotDto;
import fi.vm.sade.oppijanumerorekisteri.dto.YhteystietoRyhma;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.QHenkilo;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloHibernateRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.HenkiloRepository;
import fi.vm.sade.oppijanumerorekisteri.repositories.criteria.YhteystietoCriteria;
import fi.vm.sade.oppijanumerorekisteri.services.HenkiloService;
import fi.vm.sade.oppijanumerorekisteri.services.convert.YhteystietoConverter;
import org.jresearch.orika.spring.OrikaSpringMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

@Service
public class HenkiloServiceImpl implements HenkiloService {
    private HenkiloHibernateRepository henkiloRepository;
    private HenkiloRepository henkiloJpaRepository;
    private YhteystietoConverter yhteystietoConverter;
    private OrikaSpringMapper mapper;

    @Autowired
    public HenkiloServiceImpl(HenkiloHibernateRepository henkiloRepository,
                              HenkiloRepository henkiloJpaRepository,
                              YhteystietoConverter yhteystietoConverter,
                              OrikaSpringMapper mapper) {
        this.henkiloRepository = henkiloRepository;
        this.henkiloJpaRepository = henkiloJpaRepository;
        this.yhteystietoConverter = yhteystietoConverter;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Boolean getHasHetu(String oid) {
        String hetu = henkiloRepository.getHetuByOid(oid);
        return hetu != null && !hetu.isEmpty();
    }

    @Transactional(readOnly = true)
    public boolean getOidExists(String oid) {
        Predicate searchPredicate = QHenkilo.henkilo.oidhenkilo.eq(oid);
        return this.henkiloJpaRepository.exists(searchPredicate);
    }

    @Transactional(readOnly = true)
    public String getOidByHetu(String hetu) {
        return this.henkiloRepository.getOidByHetu(hetu);
    }

    @Transactional(readOnly = true)
    public List<HenkiloPerustietoDto> getHenkiloPerustietosByOids(List<String> oids) {
        List<Henkilo> henkilos = this.henkiloJpaRepository.findByOidhenkiloIsIn(oids);
        return mapper.mapAsList(henkilos, HenkiloPerustietoDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public HenkilonYhteystiedotViewDto getHenkiloYhteystiedot(@NotNull String henkiloOid) {
        return new HenkilonYhteystiedotViewDto(yhteystietoConverter.toHenkiloYhteystiedot(
            henkiloRepository.findYhteystiedot(new YhteystietoCriteria().withHenkiloOid(henkiloOid))
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<YhteystiedotDto> getHenkiloYhteystiedot(@NotNull String henkiloOid, @NotNull YhteystietoRyhma ryhma) {
        return ofNullable(yhteystietoConverter.toHenkiloYhteystiedot(
            henkiloRepository.findYhteystiedot(new YhteystietoCriteria()
                    .withHenkiloOid(henkiloOid)
                    .withRyhma(ryhma))
        ).get(ryhma));
    }
}
