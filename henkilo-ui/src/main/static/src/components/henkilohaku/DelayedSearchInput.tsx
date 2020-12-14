import React from "react"
import ReactTimeout from "react-timeout"

type SearchQuery = (arg0: HTMLInputElement) => void

type DelayedSearchInputProps = {
    setSearchQueryAction: SearchQuery
    loading: boolean
    defaultNameQuery: string | null | undefined
    placeholder: string | null | undefined
    customTimeout: number | null | undefined
    minSearchValueLength: number | null | undefined
    setTimeout: any
    clearTimeout: any
}

type DelayedSearchInputState = {
    timeoutEvent: any
    singleActionQueue: () => void | null | undefined
}

// Provides input with delay timer and single action queue.
class DelayedSearchInput extends React.Component<
    DelayedSearchInputProps,
    DelayedSearchInputState
> {
    timeout: number

    constructor(props) {
        super(props)

        this.timeout = this.props.customTimeout || 500

        this.state = {
            timeoutEvent: null,
            singleActionQueue: null,
        }
    }

    componentWillReceiveProps(nextProps: DelayedSearchInputProps) {
        if (!nextProps.loading && !!this.state.singleActionQueue) {
            this.state.singleActionQueue()
            this.setState({
                singleActionQueue: null,
            })
        }
    }

    render() {
        return (
            <input
                className="oph-input"
                autoFocus
                defaultValue={this.props.defaultNameQuery || ""}
                onKeyUp={this.typewatch.bind(this)}
                placeholder={this.props.placeholder}
            />
        )
    }

    typewatch(event) {
        const element: HTMLInputElement = event.target
        if (this.state.timeoutEvent !== null) {
            this.props.clearTimeout(this.state.timeoutEvent)
        }
        if (
            !this.props.minSearchValueLength ||
            !element.value ||
                element.value.length >= this.props.minSearchValueLength
        ) {
            this.setState({
                timeoutEvent: this.props.setTimeout(() => {
                    this.setState({timeoutEvent: null})
                    if (this.props.loading) {
                        this.setState({
                            singleActionQueue: () =>
                                this.props.setSearchQueryAction(element),
                        })
                    } else {
                        this.props.setSearchQueryAction(element)
                    }
                }, this.timeout),
            })
        }
    }
}

export default ReactTimeout(DelayedSearchInput)