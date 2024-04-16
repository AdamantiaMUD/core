/**
 * These formulas are stolen straight from WoW.
 * See: http://www.wowwiki.com/Formulas:XP_To_Level
 */

/**
 * Extra difficulty factor to level
 */
const reduction = (level: number): number => {
    if (level >= 11 && level <= 27) {
        return 1 - (level - 10) / 100;
    }

    if (level >= 28 && level <= 59) {
        return 0.82;
    }

    return 1;
};

/**
 * Difficulty modifier starting around level 30
 */
const diff = (level: number): number => {
    if (level <= 28) {
        return 0;
    }

    if (level === 29) {
        return 1;
    }

    if (level === 30) {
        return 3;
    }

    if (level === 31) {
        return 6;
    }

    if (level >= 32 && level <= 59) {
        return 5 * (level - 30);
    }

    return 0;
};

const mobExp = (level: number): number => 45 + 5 * level;

export const LevelUtil = {
    /**
     * Get the exp that a mob gives
     */
    mobExp: mobExp,

    /**
     * Helper to get the amount of experience a player needs to level
     */
    expToLevel: (level: number): number => {
        const levelDiff = diff(level);
        const mobXp = mobExp(level);
        const modifier = reduction(level);

        return Math.floor((4 * level + levelDiff) * mobXp * modifier);
    },
};

export default LevelUtil;
