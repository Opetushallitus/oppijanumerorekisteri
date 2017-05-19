
import VirkailijaDuplikaatitPage from './VirkailijaDuplikaatitPage';
import React from 'react';
import {connect} from 'react-redux';
import {fetchHenkilo} from '../../../actions/henkilo.actions';

class VirkailijaDuplikaatitContainer extends React.Component {

    static propTypes = {  };

    componentDidMount() {
        this.props.fetchHenkilo(this.props.oidHenkilo);
    }

    render() {
        return <VirkailijaDuplikaatitPage {...this.props}></VirkailijaDuplikaatitPage>
    }

}

const mapStateToProps = (state, ownProps) => ({
    oidHenkilo: ownProps.params['oid'],
    l10n: state.l10n.localisations,
    locale: state.locale,
});

export default connect(mapStateToProps, {fetchHenkilo})(VirkailijaDuplikaatitContainer);