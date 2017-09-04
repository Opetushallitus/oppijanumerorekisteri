import React from 'react';
import './RekisteroidyVirhe.css';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from "../../common/button/Button";

const RekisteroidyVirhe = ({L, topic, text, buttonText}) => <div className="rekisteroidyVirheWrapper" id="rekisteroidyVirhe">
    <p className="oph-h2 oph-bold oph-red">{ topic ? L[topic] : L['REKISTEROIDY_VIRHE_OTSIKKO']}</p>
    <div>
        {text ? <p className="oph-bold">{L[text]}</p> : null}
        {buttonText ? <Button href="/">{L[buttonText]}</Button> : null}
    </div>
</div>;

RekisteroidyVirhe.propTypes = {
    L: PropTypes.object,
    topic: PropTypes.string,
    text: PropTypes.string,
    buttonText: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(RekisteroidyVirhe);
