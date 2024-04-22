package fi.vm.sade.oppijanumerorekisteri.utils;

import fi.vm.sade.oppijanumerorekisteri.dto.KoodiNimiReadDto;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType;
import fi.vm.sade.oppijanumerorekisteri.models.KoodiType.KoodiMetadataType;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.Collections.emptyMap;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toMap;

public final class KoodistoUtils {

    private KoodistoUtils() {
    }

    public static KoodiNimiReadDto getKoodiNimiReadDto(Iterable<KoodiType> koodit, String koodi) {
        Optional<Map<String, String>> nimi = StreamSupport.stream(koodit.spliterator(), false)
                .filter(koodiType -> koodiType.getKoodiArvo().equals(koodi))
                .map(KoodistoUtils::getNimiByKieli)
                .findFirst();
        return new KoodiNimiReadDto(koodi, nimi.orElseGet(() -> emptyMap()));
    }

    public static Map<String, String> getNimiByKieli(KoodiType koodiType) {
        return koodiType.getMetadata().stream()
                .collect(toMap(metadata -> metadata.getKieli().value(), KoodiMetadataType::getNimi,
                        (t, u) -> Stream.of(t, u).filter(Objects::nonNull).distinct().collect(joining(", "))));
    }

}
