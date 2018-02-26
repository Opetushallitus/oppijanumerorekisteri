package fi.vm.sade.henkiloui.controllers;

import fi.vm.sade.henkiloui.configurations.ExposedResourceMessageBundleSource;
import fi.vm.sade.henkiloui.service.LocalizationService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toMap;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
@RequestMapping("/l10n")
@RequiredArgsConstructor
public class LocalizationController {
    private static final Locale FI = new Locale("fi");
    private static final Locale SV = new Locale("sv");
    private static final Locale EN = new Locale("en");
    private static final Supplier<Stream<Locale>> LOCALES = () -> Stream.of(FI,SV,EN);
    private final ExposedResourceMessageBundleSource messageSource;
    private final LocalizationService localizationService;

    @RequestMapping(method = GET)
    public Map<String,Map<String,String>> list() {
        return LOCALES.get().collect(toMap(locale -> locale.getLanguage().toLowerCase(),
            locale -> messageSource.getMessages(locale).entrySet().stream()
                .collect(toMap(e -> e.getKey().toString().toUpperCase(),
                        e -> e.getValue().toString()))));
    }

    @PostMapping
    public void synchronize() {
        localizationService.synchronize();
    }

}
