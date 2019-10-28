import Character from '../entities/character';

interface MudEventListener<T> {

}

interface MudEventEmitter {}

// this.emit('gained-follower', follower);
// this.emit('equip', slot, item);
// this.emit('followed', target);

interface GainedFollowerProps {
    follower: Character
}

interface MudEventConstructor<T> {
    new (props: T);
}

interface MudEvent {}

const GainedFollowerEvent: MudEventConstructor<GainedFollowerProps> = class GainedFollowerEvent implements MudEvent {
    public follower: Character;

    constructor(props: GainedFollowerProps) {
        this.follower = props.follower;
    }
};
