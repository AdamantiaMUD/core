export interface InputMenuOption {
    display: string;
    onSelect?: () => void | Promise<void>;
}

export default InputMenuOption;
