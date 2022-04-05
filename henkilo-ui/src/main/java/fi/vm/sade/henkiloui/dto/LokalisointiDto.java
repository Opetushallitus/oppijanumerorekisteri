package fi.vm.sade.henkiloui.dto;

import lombok.*;

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
