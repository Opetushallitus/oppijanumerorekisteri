import React from 'react';
import { Koodisto } from '../../../types/domain/koodisto/koodisto.types';
import { Kansalaisuus } from '../../../types/domain/oppijanumerorekisteri/kansalaisuus.types';
import KoodistoMultiSelect from './KoodistoMultiSelect';
import type { OnChangeHandler, Options, Option } from 'react-select';

type KansalaisuusMultiSelectProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value: Array<Kansalaisuus> | null | undefined;
    onChange: OnChangeHandler<string, Options<string> | Option<string>>;
};

/**
 * Komponentti kansalaisuuksien valitsemiseen.
 */
class KansalaisuusMultiSelect extends React.Component<KansalaisuusMultiSelectProps> {
    render() {
        return (
            <KoodistoMultiSelect
                className={this.props.className}
                placeholder={this.props.placeholder}
                koodisto={this.props.koodisto}
                value={this.props.value ? this.props.value.map((kansalaisuus) => kansalaisuus.kansalaisuusKoodi) : null}
                onChange={this.onChange}
            />
        );
    }

    onChange: OnChangeHandler<string, Options<string> | Option<string>> = (values) => {
        this.props.onChange(values?.map((value) => ({ kansalaisuusKoodi: value } as Kansalaisuus)));
    };
}

export default KansalaisuusMultiSelect;
