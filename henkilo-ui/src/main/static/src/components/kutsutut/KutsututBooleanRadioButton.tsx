import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../store';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import KutsuViews, { KutsuView } from './KutsuViews';
import { useLocalisations } from '../../selectors';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';

type OwnProps = {
    view?: KutsuView;
    setView: (newView: KutsuView) => void;
};

const KutsututBooleanRadioButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const [trueLabel, setTrueLabel] = useState('');
    const [falseLabel, setFalseLabel] = useState('');
    const [radioButtonValue, setRadioButtonValue] = useState(false);

    useEffect(() => {
        if (omattiedot?.isAdmin) {
            setFalseLabel(L['KUTSUTUT_OPH_BUTTON']);
            setTrueLabel(L['KUTSUTUT_KAIKKI_BUTTON']);
            props.setView(KutsuViews.OPH);
        } else if (omattiedot?.isOphVirkailija) {
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
        if (omattiedot.isAdmin) {
            newView = currentView === KutsuViews.OPH ? KutsuViews.DEFAULT : KutsuViews.OPH;
        } else if (omattiedot.isOphVirkailija) {
            newView = currentView === KutsuViews.KAYTTOOIKEUSRYHMA ? KutsuViews.DEFAULT : KutsuViews.KAYTTOOIKEUSRYHMA;
        } else {
            newView = KutsuViews.DEFAULT;
        }

        setRadioButtonValue(!radioButtonValue);
        props.setView(newView);
    }

    return omattiedot?.isAdmin || omattiedot?.isOphVirkailija ? (
        <BooleanRadioButtonGroup
            value={radioButtonValue}
            onChange={_toggleView.bind(this)}
            trueLabel={trueLabel}
            falseLabel={falseLabel}
            className="kutsutut-toggle"
        />
    ) : null;
};

export default KutsututBooleanRadioButton;
