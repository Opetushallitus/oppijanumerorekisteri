import React, { useEffect, useState } from 'react';

import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import KutsuViews, { KutsuView } from './KutsuViews';
import { useLocalisations } from '../../selectors';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';

type OwnProps = {
    view?: KutsuView;
    setView: (newView: KutsuView) => void;
};

const KutsututBooleanRadioButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [trueLabel, setTrueLabel] = useState<string | undefined>('');
    const [falseLabel, setFalseLabel] = useState<string | undefined>('');
    const [radioButtonValue, setRadioButtonValue] = useState(false);

    useEffect(() => {
        if (omattiedot?.isAdmin) {
            setFalseLabel(L['KUTSUTUT_OPH_BUTTON']);
            setTrueLabel(L['KUTSUTUT_KAIKKI_BUTTON']);
            props.setView(KutsuViews.OPH);
        } else if (omattiedot?.isMiniAdmin) {
            setFalseLabel(L['KUTSUTUT_OMA_KAYTTOOIKEUSRYHMA_BUTTON']);
            setTrueLabel(L['KUTSUTUT_OMA_ORGANISAATIO_BUTTON']);
            props.setView(KutsuViews.KAYTTOOIKEUSRYHMA);
        } else {
            props.setView(KutsuViews.DEFAULT);
        }
    }, [omattiedot]);

    function _toggleView() {
        let newView;
        const currentView = props.view;
        if (omattiedot?.isAdmin) {
            newView = currentView === KutsuViews.OPH ? KutsuViews.DEFAULT : KutsuViews.OPH;
        } else if (omattiedot?.isMiniAdmin) {
            newView = currentView === KutsuViews.KAYTTOOIKEUSRYHMA ? KutsuViews.DEFAULT : KutsuViews.KAYTTOOIKEUSRYHMA;
        } else {
            newView = KutsuViews.DEFAULT;
        }

        setRadioButtonValue(!radioButtonValue);
        props.setView(newView);
    }

    return omattiedot?.isAdmin || omattiedot?.isMiniAdmin ? (
        <BooleanRadioButtonGroup
            value={radioButtonValue}
            onChange={_toggleView}
            trueLabel={trueLabel!}
            falseLabel={falseLabel!}
            className="kutsutut-toggle"
        />
    ) : null;
};

export default KutsututBooleanRadioButton;
