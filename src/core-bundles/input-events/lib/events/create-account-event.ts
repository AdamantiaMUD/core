import StreamEvent from '../../../../lib/events/stream-event';

export interface CreateAccountPayload {
    name: string;
}

export class CreateAccountEvent extends StreamEvent<CreateAccountPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'create-account';
    public name: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CreateAccountEvent;
