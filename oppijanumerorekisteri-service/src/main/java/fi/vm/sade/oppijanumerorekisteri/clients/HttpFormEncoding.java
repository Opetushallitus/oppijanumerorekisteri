package fi.vm.sade.oppijanumerorekisteri.clients;

import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

public interface HttpFormEncoding {
    default HttpRequest.BodyPublisher encodeFormBody(Map<String, String> params) {
        var body = params.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
        return HttpRequest.BodyPublishers.ofString(body);
    }

    default String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
