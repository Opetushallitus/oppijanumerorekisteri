import React from 'react';

const HenkiloPage = ({testCounter, onChange}) => (
    <section>
        <h2>Henkilöhaku {testCounter}</h2>
        <input onChange={onChange}/>
    </section>
);

export default HenkiloPage;
