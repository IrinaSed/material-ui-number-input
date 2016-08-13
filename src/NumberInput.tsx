import * as React from 'react';
import TextField from 'material-ui/TextField';
import * as DeepEqual from 'deep-equal';

export type NumberInputError = 'none' | 'invalidSymbol' | 'incompleteNumber' | 'singleMinus' | 'singleFloatingPoint' | 'singleZero' | 'min' | 'max' | 'required';

export type NumberInputChangeHandler = (event: React.FormEvent, value: number) => void;

export type NumberInputErrorHandler = (error: NumberInputError) => void;

export interface NumberInputprops {
    className?: string;
    disabled?: boolean;
    floatingLabelFixed?: boolean;
    id?: string;
    name?: string;
    fullWidth?: boolean;
    underlineShow?: boolean;
    showDefaultValue?: number;
    min?: number;
    max?: number;
    required?: boolean;
}

export interface NumberInputPropsDeepEqual {
    errorText?: React.ReactNode;
    errorStyle?: React.CSSProperties;
    floatingLabelFocusStyle?: React.CSSProperties;
    floatingLabelStyle?: React.CSSProperties;
    floatingLabelText?: React.ReactNode;
    hintStyle?: React.CSSProperties;
    hintText?: React.ReactNode;
    inputStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    underlineDisabledStyle?: React.CSSProperties;
    underlineFocusStyle?: React.CSSProperties;
    underlineStyle?: React.CSSProperties;
}

export interface EventValue {
    target: {
        value?: string
    }
}

export interface NumberInputProps extends NumberInputprops, NumberInputPropsDeepEqual {
    value?: number;
    onBlur?: React.FocusEventHandler;
    onChange?: NumberInputChangeHandler;
    onError?: NumberInputErrorHandler;
    onFocus?: React.FocusEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
}

export interface NumberInputState {
    value?: string;
    error?: NumberInputError;
}

interface NumberInputCompareByValue extends NumberInputprops, NumberInputState { }

function getNumberInputCompareByValue(props: NumberInputProps, state: NumberInputState): NumberInputCompareByValue {
    return {
        className: props.className,
        disabled: props.disabled,
        floatingLabelFixed: props.floatingLabelFixed,
        id: props.id,
        name: props.name,
        fullWidth: props.fullWidth,
        underlineShow: props.underlineShow,
        showDefaultValue: props.showDefaultValue,
        min: props.min,
        max: props.max,
        required: props.required,
        value: state.value,
    };
}

function getNumberInputPropsDeepEqual(props: NumberInputProps): NumberInputPropsDeepEqual {
    return {
        errorText: props.errorText,
        errorStyle: props.errorStyle,
        floatingLabelFocusStyle: props.floatingLabelFocusStyle,
        floatingLabelStyle: props.floatingLabelStyle,
        floatingLabelText: props.floatingLabelText,
        hintStyle: props.hintStyle,
        hintText: props.hintText,
        inputStyle: props.inputStyle,
        style: props.style,
        underlineDisabledStyle: props.underlineDisabledStyle,
        underlineFocusStyle: props.underlineFocusStyle,
        underlineStyle: props.underlineStyle
    };
}

function getChangeEvent<E extends React.SyntheticEvent>(event: E): React.SyntheticEvent {
    return {
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        currentTarget: event.currentTarget,
        defaultPrevented: event.defaultPrevented,
        eventPhase: event.eventPhase,
        isTrusted: event.isTrusted,
        nativeEvent: event.nativeEvent,
        preventDefault: event.preventDefault,
        //isDefaultPrevented: event.isDefaultPrevented,
        stopPropagation: event.stopPropagation,
        //isPropagationStopped: event.isPropagationStopped,
        persist: event.persist,
        target: event.target,
        timeStamp: event.timeStamp,
        type: 'change',
    };
}

export class NumberInput extends React.Component<NumberInputProps, NumberInputState> {
    public static propTypes: Object = {
        children: React.PropTypes.node,
        className: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        errorStyle: React.PropTypes.object,
        errorText: React.PropTypes.node,
        floatingLabelFixed: React.PropTypes.bool,
        floatingLabelFocusStyle: React.PropTypes.object,
        floatingLabelStyle: React.PropTypes.object,
        floatingLabelText: React.PropTypes.node,
        fullWidth: React.PropTypes.bool,
        hintStyle: React.PropTypes.object,
        hintText: React.PropTypes.node,
        id: React.PropTypes.string,
        inputStyle: React.PropTypes.object,
        name: React.PropTypes.string,
        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func,
        onFocus: React.PropTypes.func,
        onErrro: React.PropTypes.func,
        onKeyDown: React.PropTypes.func,
        style: React.PropTypes.object,
        underlineDisabledStyle: React.PropTypes.object,
        underlineFocusStyle: React.PropTypes.object,
        underlineShow: React.PropTypes.bool,
        underlineStyle: React.PropTypes.object,
        showDefaultValue: React.PropTypes.number,
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        required: React.PropTypes.bool,
        value: React.PropTypes.number
    };
    public static defaultProps: NumberInputProps = { required: false };
    private _onKeyDown: React.KeyboardEventHandler;
    private _onBlur: React.FocusEventHandler;

    private _validateValue(value: number): number {
        const { max, min } = this.props;
        if((max !== undefined) && (value > max)) {
            return 1;
        }
        if((min !== undefined) && (value < min)) {
            return -1;
        }
        return 0;
    }

    private _emitError(error: NumberInputError): void {
        const { props, state } = this;
        const { onError } = props;
        const { error: errorState } = state;
        this.setState({ error: error }, () => {
            if((onError !== undefined) && (error !== errorState)) {
                onError(error);
            }
        });
    }

    private _emitChange(event: React.FormEvent, value: number): void {
        const { onChange } = this.props;
        if(onChange !== undefined) {
            onChange(event, value);
        }
        this._emitError('none');
    }
    
    private _handleKeyDown(event: React.KeyboardEvent): void {
        const { key } = event;
        const { props, state } = this;
        const { onKeyDown } = props;
        const { value } = state;
        const canCallOnKeyDown: boolean = onKeyDown !== undefined;
        let eventValue: EventValue = getChangeEvent(event);
        if(key.match(/^(Backspace|.)$/)) {
            event.preventDefault();
        } else {
            if(canCallOnKeyDown) {
                onKeyDown(event);
            }
            return;
        }
        if(key.match(/^(\d|\.|\-|..+)$/)) {
            let valueChange: number;
            let newValue: string;
            if(key === 'Backspace') {
                newValue = value.substring(0, value.length - 1);
            } else if(key.length === 1) {
                newValue = value + key;
            }
            if(newValue !== undefined) {
                if(newValue.match(/^-?((0|([1-9]\d{0,}))(\.\d{0,})?)?$/)) {
                    eventValue.target.value = newValue;
                    this.setState({ value: newValue });
                    if(newValue.match(/^-?((0(\.\d+)?)|([1-9]\d{0,}(\.\d+)?))$/)) {
                        valueChange = Number(newValue);
                    } else if(newValue !== '') {
                        this._emitError('incompleteNumber');
                    }
                } else {
                    const last: string = newValue[newValue.length - 1];
                    let error: NumberInputError;
                    switch(last) {
                        case '-':
                            error = 'singleMinus';
                            break;
                        case '.':
                            error = 'singleFloatingPoint';
                            break;
                        default:
                            error = 'singleZero';
                            break;
                    }
                    this._emitError(error);
                }
            } else if(key === 'Backspace') {
                this.setState({ value: '' });
            }
            if(valueChange !== undefined) {
                if(canCallOnKeyDown)  {
                    onKeyDown(event);
                }
                switch(this._validateValue(valueChange)) {
                    case 1:
                        this._emitError('max');
                        break;
                    case -1:
                        this._emitError('min');
                        break;
                    default:
                        this._emitChange(eventValue as React.FormEvent, valueChange);
                        break; 
                }
            }
        } else {
            this._emitError('invalidSymbol');
        }
    }

    private _handleBlur(event: React.FocusEvent): void {
        const { props, state } = this;
        const { showDefaultValue, onBlur, errorText, required } = props;
        const { value: oldValue } = state;
        let value: string = oldValue;
        let newValue: string;
        if(value === '-') {
            value = '';
        } else {
            const last: number = value.length - 1;
            if(value[last] === '.') {
                newValue = value.substring(0, last);
            }
        }
        if((value === '') && (showDefaultValue !== undefined)) {
            newValue = String(showDefaultValue);
        }
        const newValueDefined: boolean = newValue !== undefined;
        const numberValue: number = Number(newValueDefined ? newValue : oldValue);
        const targetValue: string = newValueDefined ? newValue : value;
        let error: NumberInputError;
        switch(this._validateValue(numberValue)) {
            case 1:
                error = 'max';
                break;
            case -1:
                error = 'min';
                break;
            default:
                if((value === '') && required) {
                    error = 'required';
                }
                break;
        }
        this.setState({ value: targetValue });
        if(onBlur !== undefined) {
            let blurEvent: EventValue = event;
            blurEvent.target.value = targetValue;
            onBlur(blurEvent as React.FocusEvent);
        }
        if(error !== undefined) {
            this._emitError(error);
        } else {
            if(newValueDefined) {
                let eventValue: EventValue = getChangeEvent(event);
                eventValue.target.value = newValue;
                this._emitChange(eventValue as React.FormEvent, numberValue);
            } else {
                this._emitError('none');
            }
        }
    }

    public constructor(props: NumberInputProps) {
        super(props);
        const { showDefaultValue, value } = this.props;
        this.state = {
            value: showDefaultValue !== undefined ? String(showDefaultValue) : (value !== undefined ? String(value) : ''),
            error: 'none'
        };
        this._onKeyDown = this._handleKeyDown.bind(this);
        this._onBlur = this._handleBlur.bind(this);
    }

    public shouldComponentUpdate(props: NumberInputProps, state: NumberInputState): boolean {
        const currentByValue: string = JSON.stringify(getNumberInputCompareByValue(props, state));
        const changeByValue: string = JSON.stringify(getNumberInputCompareByValue(this.props, this.state));
        const propsChage: boolean = !DeepEqual(getNumberInputPropsDeepEqual(props), getNumberInputPropsDeepEqual(this.props));
        const stateChange: boolean = currentByValue !== changeByValue;
        return  propsChage || stateChange;
    }

    public render(): JSX.Element {
        const { props, state, _onKeyDown, _onBlur } = this;
        let clonedProps: NumberInputProps = Object.assign({}, props);
        const { value } = state;
        if(clonedProps.showDefaultValue !== undefined) {
            delete clonedProps.showDefaultValue;
        }
        if(clonedProps.onError !== undefined) {
            delete clonedProps.onError;
        }
        return React.cloneElement(<TextField />, Object.assign(clonedProps, {
            type: 'text',
            value: value,
            onKeyDown: _onKeyDown,
            onBlur: _onBlur
        }));
    }
}

export default NumberInput;