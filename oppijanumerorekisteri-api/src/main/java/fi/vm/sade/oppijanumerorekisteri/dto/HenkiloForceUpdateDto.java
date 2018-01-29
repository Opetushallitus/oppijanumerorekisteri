package fi.vm.sade.oppijanumerorekisteri.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// NOTE: Since this works like patch is initialising null to all fields reasonable to prevent accidental list overrides
public class HenkiloForceUpdateDto extends HenkiloUpdateDto {
    private Boolean turvakielto;

}
