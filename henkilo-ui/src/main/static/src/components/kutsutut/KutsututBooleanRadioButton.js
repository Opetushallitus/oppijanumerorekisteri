// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import BooleanRadioButtonGroup from "../common/radiobuttongroup/BooleanRadioButtonGroup";
import KutsuViews from "./KutsuViews";

type Props = {
    view: string | null | void,
    L: {[key: string]: string},
    setView: (newView: string) => void,
    isAdmin: boolean,
    isOphVirkailija: boolean,
}

type State = {
    radioButtonValue: boolean,
};

class KutsututBooleanRadioButton extends React.Component<Props, State> {
    trueLabel: string;
    falseLabel: string;

    static propTypes = {
        view: PropTypes.string.isRequired,
        setView: PropTypes.func.isRequired,
    };

    constructor(props: Props) {
        super(props);

        if (this.props.isAdmin) {
            this.falseLabel = this.props.L['KUTSUTUT_OPH_BUTTON'];
            this.trueLabel = this.props.L['KUTSUTUT_KAIKKI_BUTTON'];
            this.props.setView(KutsuViews.OPH);
        }
        else if (this.props.isOphVirkailija) {
            this.falseLabel = this.props.L['KUTSUTUT_OMA_KAYTTOOIKEUSRYHMA_BUTTON'];
            this.trueLabel = this.props.L['KUTSUTUT_OMA_ORGANISAATIO_BUTTON'];
            this.props.setView(KutsuViews.KAYTTOOIKEUSRYHMA);
        }
        else {
            this.props.setView(KutsuViews.DEFAULT);
        }

        this.state = {
            radioButtonValue: false,
        }
    }

    render() {
        return this.props.isAdmin || this.props.isOphVirkailija
            ? <BooleanRadioButtonGroup value={this.state.radioButtonValue}
                                        onChange={this._toggleView.bind(this)}
                                        trueLabel={this.trueLabel}
                                        falseLabel={this.falseLabel} />
            : null;
    }

    _toggleView() {
        let newView;
        const currentView = this.props.view;
        if (this.props.isAdmin) {
            newView = currentView === KutsuViews.OPH
                ? KutsuViews.DEFAULT
                : KutsuViews.OPH;
        }
        else if (this.props.isOphVirkailija) {
            newView = currentView === KutsuViews.KAYTTOOIKEUSRYHMA
                ? KutsuViews.DEFAULT
                : KutsuViews.KAYTTOOIKEUSRYHMA;
        }
        else {
            newView = KutsuViews.DEFAULT;
        }

        this.setState({
            radioButtonValue: !this.state.radioButtonValue,
        });

        this.props.setView(newView);
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
});

export default connect(mapStateToProps, {})(KutsututBooleanRadioButton);