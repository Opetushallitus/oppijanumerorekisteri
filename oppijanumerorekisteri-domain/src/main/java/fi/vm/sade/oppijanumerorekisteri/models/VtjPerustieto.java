package fi.vm.sade.oppijanumerorekisteri.models;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class VtjPerustieto {
    public String henkilotunnus;
    public JsonNode tietoryhmat;
}
