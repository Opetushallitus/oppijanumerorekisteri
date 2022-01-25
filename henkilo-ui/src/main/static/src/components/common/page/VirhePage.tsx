import React from 'react';
import './VirhePage.css';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import Button from '../button/Button';
import { Localisations } from '../../../types/localisation.type';

type OwnProps = {
    topic?: string;
    text?: string;
    buttonText?: string;
    theme?: string;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

class VirhePage extends React.Component<Props> {
    render() {
        const classname = this.props.theme === 'gray' ? 'virhePageVirheWrapperGray' : 'virhePageVirheWrapper';
        return (
            <div className={classname} id="virhePageVirhe">
                <p className="oph-h2 oph-bold oph-red">
                    {this.props.topic ? this.props.L[this.props.topic] : this.props.L['VIRHE_PAGE_DEFAULT_OTSIKKO']}
                </p>
                <div>
                    {this.props.text ? <p className="oph-bold">{this.props.L[this.props.text]}</p> : null}
                    {this.props.buttonText ? <Button href="/">{this.props.L[this.props.buttonText]}</Button> : null}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations['fi'],
});

export default connect<StateProps>(mapStateToProps)(VirhePage);
