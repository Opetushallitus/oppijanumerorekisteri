package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.*;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kansalaisuus;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.repositories.TuontiRepository;
import fi.vm.sade.oppijanumerorekisteri.services.Koodisto;
import fi.vm.sade.oppijanumerorekisteri.services.KoodistoService;
import fi.vm.sade.oppijanumerorekisteri.utils.KoodistoUtils;
import ma.glasnost.orika.CustomMapper;
import ma.glasnost.orika.MapperFactory;
import ma.glasnost.orika.MappingContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import dev.akkinoc.spring.boot.orika.OrikaMapperFactoryConfigurer;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiConsumer;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Component
public class OppijaMappers implements OrikaMapperFactoryConfigurer {
    @Autowired
    TuontiRepository tuontiRepository;
    @Autowired
    KoodistoService koodistoService;

    @Override
    public void configure(MapperFactory orikaMapperFactory) {
        orikaMapperFactory.classMap(Henkilo.class, OppijaListDto.class)
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
                .register();

        orikaMapperFactory.classMap(Henkilo.class, HenkiloDto.class)
                .byDefault()
                .customize(customMapper((Henkilo henkilo, HenkiloDto dto) -> {
                    if (henkilo.getTurvakielto()) {
                        dto.setKotikunta(null);
                    }
                    if (henkilo.getYksilointivirheet() == null) {
                        dto.setYksilointivirheet(null);
                    }
                }))
                .register();

        orikaMapperFactory.classMap(Henkilo.class, OppijaReadDto.class)
                .byDefault()
                .field("oidHenkilo", "oid")
                .field("created", "luotu")
                .field("modified", "muokattu")
                .customize(new CustomMapper<Henkilo, OppijaReadDto>() {
                    @Override
                    public void mapAtoB(Henkilo henkilo, OppijaReadDto oppijaReadDto, MappingContext context) {
                        if (henkilo.getTurvakielto()) {
                            oppijaReadDto.setKotikunta(null);
                        } else if (henkilo.getKotikunta() != null) {
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
                .register();

        orikaMapperFactory.classMap(OppijaTuontiRiviCreateDto.OppijaTuontiRiviHenkiloCreateDto.class, Henkilo.class)
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
                .register();
    }

    private <A, B> CustomMapper<A, B> customMapper(BiConsumer<A, B> consumer) {
        return new CustomMapper<A, B>() {
            @Override
            public void mapAtoB(A a, B b, MappingContext context) {
                consumer.accept(a, b);
            }
        };
    }
}
