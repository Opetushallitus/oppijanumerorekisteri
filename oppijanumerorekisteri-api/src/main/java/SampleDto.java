import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class SampleDto implements Serializable {
    private final static long serialVersionUID = 100L;

    private String something;
}
