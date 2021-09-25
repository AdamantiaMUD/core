import type BehaviorDefinition from '../../../../lib/behaviors/behavior-definition';

/**
 * A behavior that causes an NPC to patrol an area when not in combat. This
 * behavior should be much like wander, but with a more rigid path and regular
 * intervals.
 */
export const patrol: BehaviorDefinition = {
    listeners: {},
};

export default patrol;
