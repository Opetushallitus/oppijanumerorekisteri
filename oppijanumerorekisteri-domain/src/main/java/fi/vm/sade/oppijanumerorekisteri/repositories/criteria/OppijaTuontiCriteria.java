package fi.vm.sade.oppijanumerorekisteri.repositories.criteria;

import io.swagger.annotations.ApiModelProperty;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.joda.time.DateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class OppijaTuontiCriteria {

    private Long tuontiId;

    @ApiModelProperty("ISO 8601 -muodossa, esim. 2017-09-05T10:04:59Z")
    private DateTime muokattuJalkeen;

    @ApiModelProperty(hidden = true)
    private Set<String> organisaatioOids;

    public boolean setOrRetainOrganisaatioOids(Set<String> oids) {
        if (organisaatioOids == null || organisaatioOids.isEmpty()) {
            organisaatioOids = oids;
            return true;
        }
        return organisaatioOids.retainAll(oids);
    }

}
