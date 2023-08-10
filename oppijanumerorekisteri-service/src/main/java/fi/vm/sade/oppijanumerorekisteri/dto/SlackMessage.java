package fi.vm.sade.oppijanumerorekisteri.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class SlackMessage {
    String text;
    List<MessageBlock> blocks;

    @Getter
    @Setter
    public static class MessageBlock {
        public enum Type {
            header, section
        };
        private Type type;
        private Text text;

        @AllArgsConstructor
        @RequiredArgsConstructor
        @NoArgsConstructor
        @Getter
        public static class Text {
            public enum Type {
                mrkdwn, plain_text
            };
            @NonNull
            private Type type;
            @NonNull
            private String text;

            @JsonInclude(JsonInclude.Include.NON_NULL)
            private Boolean emoji;

        }
    }
}