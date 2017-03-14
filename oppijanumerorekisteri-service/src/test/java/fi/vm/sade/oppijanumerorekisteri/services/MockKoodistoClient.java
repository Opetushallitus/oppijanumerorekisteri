package fi.vm.sade.oppijanumerorekisteri.services;

import fi.vm.sade.koodisto.service.types.common.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.clients.KoodistoClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class MockKoodistoClient implements KoodistoClient{

    private static List<KoodiType> maatjavaltiot2KoodiTypes = new ArrayList<>();

    static {

        KoodiType koodiType;

        koodiType = new KoodiType();
        koodiType.setKoodiUri("maatjavaltiot2_752");
        koodiType.setVersio(1);
        koodiType.setKoodiArvo("752");
        maatjavaltiot2KoodiTypes.add(koodiType);

        koodiType = new KoodiType();
        koodiType.setKoodiUri("maatjavaltiot2_246");
        koodiType.setVersio(1);
        koodiType.setKoodiArvo("246");
        maatjavaltiot2KoodiTypes.add(koodiType);

    }

    @Override
    public List<KoodiType> getKoodisForKoodisto(String koodistoUri, int koodistoVersio, boolean onlyValidKoodis) {
        List<KoodiType> result = new ArrayList<>();

        if("maatjavaltiot2".equals(koodistoUri)) {
            result = maatjavaltiot2KoodiTypes;
        }

        return result;
    }

    @Override
    public List<String> getKoodiValuesForKoodisto(String koodistoUri, int koodistoVersion, boolean onlyValidKoodis) {
        return getKoodisForKoodisto(koodistoUri, koodistoVersion, onlyValidKoodis)
                .stream().map(KoodiType::getKoodiArvo).collect(Collectors.toList());
    }
}
