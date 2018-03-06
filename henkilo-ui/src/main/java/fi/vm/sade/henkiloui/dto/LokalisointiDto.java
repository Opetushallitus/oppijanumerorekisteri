package fi.vm.sade.henkiloui.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class LokalisointiDto {

    private String category;
    private String locale;
    private String key;
    private String value;

}
