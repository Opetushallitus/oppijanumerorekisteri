import React from 'react';
import PropTypes from 'prop-types';
import Field from '../common/field/Field';

class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: '',
        };
    }

    render() {
        return (
          <form>
              <Field inputValue={this.state.q}
                     changeAction={this.onChange}
                     placeholder="Vähintään kolme merkkiä..."></Field>
          </form>
        );
    }

    onChange = (event) => {
        const q = event.target.value;
        this.setState({q: q});
        if (q.length >= 3) {
            this.props.onSubmit({q: this.state.q});
        }
    }
};

HaetutKayttooikeusRyhmatHakuForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default HaetutKayttooikeusRyhmatHakuForm;
