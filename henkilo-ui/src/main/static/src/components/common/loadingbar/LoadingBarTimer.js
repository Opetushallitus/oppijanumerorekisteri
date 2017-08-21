import React from 'react'
import PropTypes from 'prop-types'
import ReactTimeout from 'react-timeout'
import {Line} from "react-progressbar.js"
import moment from 'moment'

class LoadingBarTimer extends React.Component {

    constructor(props) {
        super(props);

        this.progressBarOptions = {
            strokeWidth: 2,
            duration: 200,
            trailWidth: 0,
            color: '#159ECB',
            warnings: true,
        };

        this.containerStyles = {
            width: '100%',
            height: '100%',
            border: "1px solid gray",
            borderRadius: '4px',
            marginLeft: "-1px",};

        this.state = {
            progress: 0,
        };
    }

    componentDidMount() {
        const initializeTime = () => {
            this.startTime = moment();
            this.stopTime = moment(this.startTime).add(this.props.timeInSeconds, 'seconds');
        };
        initializeTime();
        const calculateProgress = () => {
            if(this.props.restartAfterFinished && this.state.progress >= 1.0) {
                initializeTime();
                return 0;
            }
            return moment().diff(this.startTime, 'seconds', true) / this.props.timeInSeconds;
        };
        const updateProgress = () => {
            this.setState({
                    progress: calculateProgress(this.startTime)
                },
                () => {
                    if(this.props.stopAfterFinished && this.stopTime.isSameOrAfter(moment()))
                        this.props.clearInterval(this.intervalId)
                })};
        this.intervalId = this.props.setInterval(updateProgress, 200);
    }

    static propTypes = {
        timeInSeconds: PropTypes.number.isRequired,
        stopAfterFinished: PropTypes.bool,
        restartAfterFinished: PropTypes.bool,
    };

    render() {
        return <div>
            <Line progress={this.state.progress}
                  containerStyle={this.containerStyles}
                  options={this.progressBarOptions}
                  initialAnimate={false}
            />
        </div>;
    }

}

export default ReactTimeout(LoadingBarTimer);
