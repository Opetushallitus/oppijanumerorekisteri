package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.assumptions;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.apereo.cas.client.validation.Assertion;
import org.apereo.cas.client.validation.Cas30ServiceTicketValidator;

abstract class CasAssumptionsTestBase {

  abstract String casServerUrl();

  abstract String serviceBaseUrl();

  protected Assertion authenticateAndValidate(String username, String password) throws Exception {
    var casServerUrl = casServerUrl();
    var serviceUrl = serviceBaseUrl();
    var ticket = obtainServiceTicket(casServerUrl, username, password);
    var validator = new Cas30ServiceTicketValidator(casServerUrl);
    return validator.validate(ticket, serviceUrl);
  }

  /**
   * Simulates the CAS login flow: GET login page, POST credentials, extract ticket from redirect.
   * Cookies are handled manually because Keycloak sets Secure flag even over HTTP.
   */
  private String obtainServiceTicket(String casServerUrl, String username, String password)
      throws Exception {
    var httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();

    // GET the login page to get the form action URL and session cookies
    var loginPageUrl =
        casServerUrl
            + "/login?service="
            + URLEncoder.encode(serviceBaseUrl(), StandardCharsets.UTF_8);
    var loginPageResponse =
        httpClient.send(
            HttpRequest.newBuilder().uri(URI.create(loginPageUrl)).GET().build(),
            HttpResponse.BodyHandlers.ofString());

    var cookies = extractCookies(loginPageResponse);
    var formAction = extractFormAction(loginPageResponse.body(), loginPageUrl);

    // POST credentials to the login form
    var body =
        "username="
            + URLEncoder.encode(username, StandardCharsets.UTF_8)
            + "&password="
            + URLEncoder.encode(password, StandardCharsets.UTF_8);
    var loginResponse =
        httpClient.send(
            HttpRequest.newBuilder()
                .uri(URI.create(formAction))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Cookie", cookies)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build(),
            HttpResponse.BodyHandlers.ofString());

    assertThat(loginResponse.statusCode())
        .as(
            "Login should redirect (302), got %d: %s",
            loginResponse.statusCode(), loginResponse.body())
        .isEqualTo(302);

    var location = loginResponse.headers().firstValue("Location").orElseThrow();
    var ticketPattern = Pattern.compile("[?&]ticket=([^&]+)");
    var matcher = ticketPattern.matcher(location);
    assertThat(matcher.find())
        .as("Redirect should contain a ticket parameter: %s", location)
        .isTrue();
    return matcher.group(1);
  }

  private String extractCookies(HttpResponse<?> response) {
    return response.headers().allValues("Set-Cookie").stream()
        .map(cookie -> cookie.split(";")[0])
        .collect(Collectors.joining("; "));
  }

  private String extractFormAction(String html, String fallbackUrl) {
    var pattern = Pattern.compile("action=\"([^\"]+)\"");
    var matcher = pattern.matcher(html);
    if (matcher.find()) {
      var action = matcher.group(1).replace("&amp;", "&");
      if (action.startsWith("http")) {
        return action;
      }
      var base = URI.create(fallbackUrl);
      return base.getScheme() + "://" + base.getAuthority() + action;
    }
    return fallbackUrl;
  }
}
