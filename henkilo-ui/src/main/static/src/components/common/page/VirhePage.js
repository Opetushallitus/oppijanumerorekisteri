import React from 'react';
import './VirhePage.css';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from "../button/Button";

const VirhePage = ({L, topic, text, buttonText, theme}) => {
    const classname = theme === 'gray' ? 'virhePageVirheWrapperGray' : 'virhePageVirheWrapper';
    return <div className={classname} id="virhePageVirhe">
        <p className="oph-h2 oph-bold oph-red">{ topic ? L[topic] : L['VIRHE_PAGE_DEFAULT_OTSIKKO']}</p>
        <div>
            {text ? <p className="oph-bold">{L[text]}</p> : null}
            {buttonText ? <Button href="/">{L[buttonText]}</Button> : null}
        </div>
    </div>;
};

VirhePage.propTypes = {
    topic: PropTypes.string,
    text: PropTypes.string,
    buttonText: PropTypes.string,
    theme: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(VirhePage);
