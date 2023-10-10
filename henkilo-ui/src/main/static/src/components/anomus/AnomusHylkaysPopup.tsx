import React from 'react';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { Localisations } from '../../types/localisation.type';

type Props = {
    L: Localisations;
    action: (arg0: number, arg1: string, arg3: HenkilonNimi, arg4: string) => void;
    kayttooikeusryhmaId: number;
    henkilo: HenkilonNimi;
};

type State = {
    hylkaysperuste: string;
};

export default class AnomusHylkaysPopup extends React.Component<Props, State> {
    state: State = {
        hylkaysperuste: '',
    };

    render() {
        return (
            <div className="anomus-hylkays-popup">
                <textarea
                    className="oph-input"
                    placeholder={this.props.L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYSPERUSTE']}
                    name="hylkaysperuste"
                    id="hylkaysperuste"
                    value={this.state.hylkaysperuste}
                    cols={20}
                    rows={10}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                        this.onHylkaysperusteChange(event.target.value);
                    }}
                ></textarea>
                <button
                    className="oph-button oph-button-confirm"
                    style={{ textAlign: 'left', marginTop: '15px' }}
                    onClick={() => {
                        this.props.action(
                            this.props.kayttooikeusryhmaId,
                            KAYTTOOIKEUDENTILA.HYLATTY,
                            this.props.henkilo,
                            this.state.hylkaysperuste
                        );
                    }}
                >
                    {this.props.L['HENKILO_KAYTTOOIKEUSANOMUS_VAHVISTA_HYLKAYS']}
                </button>
            </div>
        );
    }

    onHylkaysperusteChange = (value: string): void => {
        this.setState({ hylkaysperuste: value });
    };
}
