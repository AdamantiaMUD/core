export interface Broadcastable {
    getBroadcastTargets: () => Broadcastable[];
}

export default Broadcastable;
