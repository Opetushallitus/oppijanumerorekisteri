// @flow
import React from 'react';
import './VirhePage.css';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from "../button/Button";
import type {L} from "../../../types/localisation.type";
import {updateUnauthenticatedNavigation} from "../../../actions/navigation.actions";

type Props = {
    topic: string,
    text: string,
    buttonText: string,
    theme: string,
    L: L,
    updateUnauthenticatedNavigation: () => void,
}

class VirhePage extends React.Component<Props> {
    componentWillMount() {
        this.props.updateUnauthenticatedNavigation();
    }
    render() {
        const classname = this.props.theme === 'gray' ? 'virhePageVirheWrapperGray' : 'virhePageVirheWrapper';
        return <div className={classname} id="virhePageVirhe">
            <p className="oph-h2 oph-bold oph-red">{ this.props.topic
                ? this.props.L[this.props.topic]
                : this.props.L['VIRHE_PAGE_DEFAULT_OTSIKKO']}</p>
            <div>
                {this.props.text ? <p className="oph-bold">{this.props.L[this.props.text]}</p> : null}
                {this.props.buttonText ? <Button href="/">{this.props.L[this.props.buttonText]}</Button> : null}
            </div>
        </div>;
    }
}

VirhePage.propTypes = {
    topic: PropTypes.string,
    text: PropTypes.string,
    buttonText: PropTypes.string,
    theme: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {updateUnauthenticatedNavigation})(VirhePage);
