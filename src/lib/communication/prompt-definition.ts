export interface PromptDefinition {
    removeOnRender: boolean;
    renderer: () => string;
}

export default PromptDefinition;
