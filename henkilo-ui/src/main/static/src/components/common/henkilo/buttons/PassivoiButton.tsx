import React, { useState } from 'react';
import { connect } from 'react-redux';
import { type RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import Button from '../../button/Button';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { usePassivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { ButtonNotification } from '../../button/NotificationButton';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type Props = OwnProps & StateProps;

const PassivoiButton = (props: Props) => {
    const [passivoiHenkilo] = usePassivoiHenkiloMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    return props.henkilo.henkilo.passivoitu ? (
        <Button key="passivoi" disabled={!!props.henkilo.henkilo.passivoitu}>
            {props.L['PASSIVOI_PASSIVOITU']}
        </Button>
    ) : (
        <ConfirmButton
            key="passivoi"
            action={() =>
                passivoiHenkilo(props.henkilo.henkilo.oidHenkilo)
                    .unwrap()
                    .catch(() =>
                        setNotification({
                            notL10nMessage: 'PASSIVOI_ERROR_TOPIC',
                            notL10nText: 'PASSIVOI_ERROR_TEXT',
                        })
                    )
            }
            normalLabel={props.L['PASSIVOI_LINKKI']}
            confirmLabel={props.L['PASSIVOI_LINKKI_CONFIRM']}
            disabled={!!props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(PassivoiButton);
