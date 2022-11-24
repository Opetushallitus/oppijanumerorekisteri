package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.services.OppijaTuontiService;
import fi.vm.sade.oppijanumerorekisteri.utils.KoodistoUtils;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;
import ma.glasnost.orika.metadata.ClassMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Configuration
public class OppijaMappers {

    @Bean
    public ClassMap<Henkilo, OppijaListDto> oppijaListDtoClassMap(MapperFactory mapperFactory, TuontiRepository tuontiRepository) {
        return mapperFactory.classMap(Henkilo.class, OppijaListDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .customize(new CustomMapper<Henkilo, OppijaListDto>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, OppijaListDto oppijaListDto, MappingContext context) {
                        tuontiRepository.getServiceUserForImportedPerson(henkilo.getOidHenkilo()).ifPresent(serviceUser -> {
                            oppijaListDto.setServiceUserOid(serviceUser.getOid());
                            oppijaListDto.setServiceUserName(serviceUser.getName());
                        });
                    }
                })
                .toClassMap();
    }

    @Bean
    public ClassMap<Henkilo, OppijaReadDto> oppijaReadDtoClassMap(MapperFactory mapperFactory, KoodistoService koodistoService) {
        return mapperFactory.classMap(Henkilo.class, OppijaReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .customize(new CustomMapper<Henkilo, OppijaReadDto>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, OppijaReadDto oppijaReadDto, MappingContext context) {
                        if (henkilo.getKotikunta() != null) {
                            Iterable<KoodiType> koodit = koodistoService.list(Koodisto.KUNTA);
                            KoodiNimiReadDto kotikunta = KoodistoUtils.getKoodiNimiReadDto(koodit, henkilo.getKotikunta());
                            oppijaReadDto.setKotikunta(kotikunta);
                        }
                        if (henkilo.getSukupuoli() != null) {
                            Iterable<KoodiType> koodit = koodistoService.list(Koodisto.SUKUPUOLI);
                            KoodiNimiReadDto sukupuoli = KoodistoUtils.getKoodiNimiReadDto(koodit, henkilo.getSukupuoli());
                            oppijaReadDto.setSukupuoli(sukupuoli);
                        }
                        if (henkilo.getAidinkieli() != null && henkilo.getAidinkieli().getKieliKoodi() != null) {
                            Iterable<KoodiType> koodit = koodistoService.list(Koodisto.KIELI);
                            KoodiNimiReadDto aidinkieli = KoodistoUtils.getKoodiNimiReadDto(koodit, henkilo.getAidinkieli().getKieliKoodi().toUpperCase());
                            oppijaReadDto.setAidinkieli(aidinkieli);
                        }
                        if (henkilo.getKansalaisuus() != null) {
                            Iterable<KoodiType> koodit = koodistoService.list(Koodisto.MAAT_JA_VALTIOT_2);
                            List<KoodiNimiReadDto> kansalaisuus = henkilo.getKansalaisuus().stream()
                                    .map(koodi -> KoodistoUtils.getKoodiNimiReadDto(koodit, koodi.getKansalaisuusKoodi()))
                                    .collect(toList());
                            oppijaReadDto.setKansalaisuus(kansalaisuus);
                        }
                    }
                })
                .toClassMap();
    }

    @Bean
    public ClassMap<OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto, Henkilo> oppijaCreateDtoClassMap(MapperFactory mapperFactory) {
        return mapperFactory.classMap(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.class, Henkilo.class)
                .byDefault()
                .customize(new CustomMapper<OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto, Henkilo>() {
                    @Override
                    public void mapAtoB(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto oppijaCreateDto, Henkilo henkilo, MappingContext context) {
                        Optional.ofNullable(oppijaCreateDto.getSukupuoli())
                                .flatMap(dto -> Optional.ofNullable(dto.getKoodi()))
                                .ifPresent(koodi -> henkilo.setSukupuoli(koodi));
                        Optional.ofNullable(oppijaCreateDto.getAidinkieli())
                                .flatMap(dto -> Optional.ofNullable(dto.getKoodi()))
                                .ifPresent(koodi -> henkilo.setAidinkieli(new Kielisyys(koodi.toLowerCase())));
                        Optional.ofNullable(oppijaCreateDto.getKansalaisuus())
                                .map(list -> list.stream()
                                        .filter(Objects::nonNull)
                                        .map(KoodiUpdateDto::getKoodi)
                                        .filter(Objects::nonNull)
                                        .map(koodi -> new Kansalaisuus(koodi))
                                        .collect(toSet()))
                                .ifPresent(list -> henkilo.setKansalaisuus(list));
                    }
                })
                .toClassMap();
    }

}
