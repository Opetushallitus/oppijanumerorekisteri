package fi.vm.sade.oppijanumerorekisteri.mappers;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloOmattiedotDto;
import fi.vm.sade.oppijanumerorekisteri.models.Henkilo;
import fi.vm.sade.oppijanumerorekisteri.models.Kielisyys;
import ma.glasnost.orika.MapperFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class HenkiloOmattiedotDtoMapperTest {

    @Autowired
    private MapperFacade modelmapper;

    @Test
    public void henkiloEntityShouldMapToHenkiloOmattiedotDto() {
        Henkilo entity = Henkilo.builder()
                .asiointiKieli(Kielisyys.builder()
                        .kieliKoodi("sv")
                        .kieliTyyppi("svenska")
                        .build())
                .kutsumanimi("testikutsumanimi")
                .sukunimi("testisukunimi")
                .build();

        HenkiloOmattiedotDto dto = this.modelmapper.map(entity, HenkiloOmattiedotDto.class);

        assertThat(dto.getAsiointikieli()).isEqualTo("sv");
        assertThat(dto.getKutsumanimi()).isEqualTo("testikutsumanimi");
        assertThat(dto.getSukunimi()).isEqualTo("testisukunimi");

        entity.setAsiointiKieli(Kielisyys.builder()
                .kieliKoodi("en")
                .kieliTyyppi("English")
                .build());

        HenkiloOmattiedotDto dtoEn = this.modelmapper.map(entity, HenkiloOmattiedotDto.class);
        assertThat(dtoEn.getAsiointikieli()).isEqualTo("en");

        entity.setAsiointiKieli(Kielisyys.builder()
                .kieliKoodi("fi")
                .kieliTyyppi("suomi")
                .build());

        HenkiloOmattiedotDto dtoFi = this.modelmapper.map(entity, HenkiloOmattiedotDto.class);
        assertThat(dtoFi.getAsiointikieli()).isEqualTo("fi");
    }

    @Test
    public void henkiloEntityNullAsiointiKieliShouldMapToHenkiloOmattiedotDtoFinnishAsiointikieli() {
        Henkilo entityNoAsiointikieli = Henkilo.builder()
                .kutsumanimi("testikutsumanimi2")
                .sukunimi("testisukunimi2")
                .build();

        HenkiloOmattiedotDto dtoWithDefaultLangFi = this.modelmapper.map(entityNoAsiointikieli, HenkiloOmattiedotDto.class);

        assertThat(dtoWithDefaultLangFi.getKutsumanimi()).isEqualTo("testikutsumanimi2");
        assertThat(dtoWithDefaultLangFi.getSukunimi()).isEqualTo("testisukunimi2");
        assertThat(dtoWithDefaultLangFi.getAsiointikieli()).isEqualTo("fi");
    }

    @Test
    public void henkiloOmattiedotDtoShouldMapToEntity() {
        HenkiloOmattiedotDto dto = new HenkiloOmattiedotDto();
        dto.setAsiointikieli("sv");
        dto.setKutsumanimi("testikutsumanimi");
        dto.setSukunimi("testisukunimi");

        Henkilo entity = this.modelmapper.map(dto, Henkilo.class);

        assertThat(entity.getAsiointiKieli().getKieliKoodi()).isEqualTo("sv");
        assertThat(entity.getKutsumanimi()).isEqualTo("testikutsumanimi");
        assertThat(entity.getSukunimi()).isEqualTo("testisukunimi");

        dto.setAsiointikieli("en");
        Henkilo entityEn = this.modelmapper.map(dto, Henkilo.class);
        assertThat(entityEn.getAsiointiKieli().getKieliKoodi()).isEqualTo("en");

        dto.setAsiointikieli("fi");
        Henkilo entityFi = this.modelmapper.map(dto, Henkilo.class);
        assertThat(entityFi.getAsiointiKieli().getKieliKoodi()).isEqualTo("fi");

        dto.setAsiointikieli(null);
        Henkilo entityLangNull = this.modelmapper.map(dto, Henkilo.class);
        assertThat(entityLangNull.getAsiointiKieli()).isNull();
    }
}
