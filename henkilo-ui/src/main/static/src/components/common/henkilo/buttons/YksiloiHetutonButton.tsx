import React from 'react';
import { connect } from 'react-redux';
import { useAppDispatch, type RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { useYksiloiHetutonMutation } from '../../../../api/oppijanumerorekisteri';
import { YKSILOI_HENKILO_FAILURE, YKSILOI_PUUTTUVAT_TIEDOT_FAILURE } from '../../../../actions/actiontypes';

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
    const dispatch = useAppDispatch();
    if (henkilo.yksiloityVTJ || henkilo.hetu || henkilo.yksiloity) {
        return null;
    }

    const isValidHenkilo =
        henkilo.etunimet &&
        henkilo.sukunimi &&
        henkilo.kutsumanimi &&
        henkilo.sukupuoli &&
        henkilo.syntymaaika &&
        henkilo.aidinkieli &&
        henkilo.kansalaisuus?.length;

    return (
        <ConfirmButton
            key="yksilointi"
            action={() =>
                isValidHenkilo
                    ? yksiloiHetuton(henkilo.oidHenkilo)
                          .unwrap()
                          .catch(() =>
                              dispatch({
                                  type: YKSILOI_HENKILO_FAILURE,
                                  receivedAt: Date.now(),
                                  buttonNotification: {
                                      position: 'yksilointi',
                                      notL10nMessage: 'YKSILOI_ERROR_TOPIC',
                                      notL10nText: 'YKSILOI_ERROR_TEXT',
                                  },
                              })
                          )
                    : dispatch({
                          type: YKSILOI_PUUTTUVAT_TIEDOT_FAILURE,
                          buttonNotification: {
                              position: 'yksilointi',
                              notL10nMessage: 'YKSILOI_PUUTTUVAT_TIEDOT_TOPIC',
                              notL10nText: 'YKSILOI_PUUTTUVAT_TIEDOT_TEXT',
                          },
                          receivedAt: Date.now(),
                      })
            }
            normalLabel={props.L['YKSILOI_LINKKI']}
            confirmLabel={props.L['YKSILOI_LINKKI_CONFIRM']}
            disabled={props.disabled}
            id="yksilointi"
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(YksiloiHetutonButton);
