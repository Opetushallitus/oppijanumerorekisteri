package fi.vm.sade.oppijanumerorekisteri.configurations.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import org.springframework.boot.jackson.JsonComponent;

/**
 * Jackson-konfiguraatio {@link LocalDate}:lle.
 */
@JsonComponent
public class LocalDateJsonComponent {

    public static class Serializer extends StdSerializer<LocalDate> {

        public Serializer() {
            super(LocalDate.class);
        }

        @Override
        public void serialize(LocalDate value, JsonGenerator gen, SerializerProvider provider) throws IOException {
            gen.writeString(value.toString());
        }

    }

    public static class Deserializer extends StdDeserializer<LocalDate> {

        public Deserializer() {
            super(LocalDate.class);
        }

        @Override
        public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JsonProcessingException {
            if (!p.hasToken(JsonToken.VALUE_STRING)) {
                throw ctxt.wrongTokenException(p, LocalDate.class, JsonToken.VALUE_STRING, null);
            }
            String string = p.getText().trim();
            if (string.isEmpty()) {
                return null;
            }
            try {
                return LocalDate.parse(string);
            } catch (DateTimeParseException e1) {
                JsonMappingException e2 = ctxt.weirdStringException(string, handledType(), e1.getMessage());
                e2.initCause(e1);
                throw e2;
            }
        }

    }

}
