import React, { useState } from 'react';
import { connect } from 'react-redux';
import { type RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { useYksiloiHetutonMutation } from '../../../../api/oppijanumerorekisteri';
import { isHenkiloValidForYksilointi } from '../../../../validation/YksilointiValidator';
import { ButtonNotification } from '../../button/NotificationButton';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type Props = OwnProps & StateProps;

const YksiloiHetutonButton = (props: Props) => {
    const henkilo = props.henkilo.henkilo;
    const [yksiloiHetuton] = useYksiloiHetutonMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    if (henkilo.yksiloityVTJ || henkilo.hetu || henkilo.yksiloity) {
        return null;
    }

    return (
        <ConfirmButton
            key="yksilointi"
            action={() =>
                isHenkiloValidForYksilointi(henkilo)
                    ? yksiloiHetuton(henkilo.oidHenkilo)
                          .unwrap()
                          .catch(() =>
                              setNotification({
                                  notL10nMessage: 'YKSILOI_ERROR_TOPIC',
                                  notL10nText: 'YKSILOI_ERROR_TEXT',
                              })
                          )
                    : setNotification({
                          notL10nMessage: 'YKSILOI_PUUTTUVAT_TIEDOT_TOPIC',
                          notL10nText: 'YKSILOI_PUUTTUVAT_TIEDOT_TEXT',
                      })
            }
            normalLabel={props.L['YKSILOI_LINKKI']}
            confirmLabel={props.L['YKSILOI_LINKKI_CONFIRM']}
            disabled={props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(YksiloiHetutonButton);
