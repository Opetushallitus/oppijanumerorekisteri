package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
// NOTE: Since this works like patch is initialising null to all fields reasonable to prevent accidental list overrides
public class HenkiloForceUpdateDto extends HenkiloUpdateDto {

    private Set<String> kaikkiHetut;

    private Boolean turvakielto;

    private Set<HuoltajaCreateDto> huoltajat;

}
