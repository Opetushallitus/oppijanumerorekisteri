package fi.vm.sade.oppijanumerorekisteri.configurations.json;

import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;
import tools.jackson.databind.ser.std.StdSerializer;

import java.time.LocalDate;

import org.springframework.boot.jackson.JacksonComponent;

@JacksonComponent
public class LocalDateJsonComponent {
    public static class Serializer extends StdSerializer<LocalDate> {
        public Serializer() {
            super(LocalDate.class);
        }

        @Override
        public void serialize(LocalDate value, JsonGenerator gen, SerializationContext ctxt) {
            gen.writeString(value.toString());
        }
    }

    public static class Deserializer extends StdDeserializer<LocalDate> {
        public Deserializer() {
            super(LocalDate.class);
        }

        @Override
        public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) {
            if (!p.hasToken(JsonToken.VALUE_STRING)) {
                throw ctxt.wrongTokenException(p, LocalDate.class, JsonToken.VALUE_STRING, null);
            }
            String string = p.getString().trim();
            if (string.isEmpty()) {
                return null;
            }
            return LocalDate.parse(string);
        }
    }
}
