import React from 'react';
import OphModal from '../common/modal/OphModal';

type Props = {
    tuontiId: number;
    onClose: () => void;
};

const TuontiDetails: React.FC<Props> = ({ tuontiId, onClose }) => <OphModal onClose={onClose}>{tuontiId}</OphModal>;

export default TuontiDetails;
