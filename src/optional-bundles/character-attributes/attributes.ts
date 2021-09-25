import type AttributeDefinition from '../../lib/attributes/attribute-definition';

const atts: AttributeDefinition[] = [
    // Core stats
    {name: 'hp', base: 1},
    {name: 'move', base: 80},
    {name: 'speed', base: 2.5},

    // Ability scores
    {name: 'strength', base: 0},
    {name: 'dexterity', base: 0},
    {name: 'agility', base: 0},
    {name: 'constitution', base: 0},
    {name: 'intelligence', base: 0},
    {name: 'power', base: 0},
    {name: 'wisdom', base: 0},
    {name: 'charisma', base: 0},

    // Alignment
    {name: 'ethics', base: 0},
    {name: 'morality', base: 0},

    // Combat
    {name: 'armor', base: 0},
    {name: 'wimpy', base: 10},

    // Resistances, mundane
    {name: 'damage-resistance.bludgeoning', base: 0},
    {name: 'damage-resistance.piercing', base: 0},
    {name: 'damage-resistance.ranged', base: 0},
    {name: 'damage-resistance.slashing', base: 0},
    {name: 'damage-resistance.unarmed', base: 0},

    // Resistances, elemental
    {name: 'damage-resistance.acid', base: 0},
    {name: 'damage-resistance.cold', base: 0},
    {name: 'damage-resistance.electricity', base: 0},
    {name: 'damage-resistance.fire', base: 0},
    {name: 'damage-resistance.force', base: 0},
    {name: 'damage-resistance.poison', base: 0},
    {name: 'damage-resistance.sonic', base: 0},

    // Resistances, alignment
    {name: 'damage-resistance.lawful', base: 0},
    {name: 'damage-resistance.chaotic', base: 0},
    {name: 'damage-resistance.good', base: 0},
    {name: 'damage-resistance.evil', base: 0},
    {name: 'damage-resistance.radiant', base: 0},
    {name: 'damage-resistance.necrotic', base: 0},

    // Resistances, other
    {name: 'damage-resistance.mental', base: 0},
    {name: 'damage-resistance.psionic', base: 0},
    {name: 'damage-resistance.spells', base: 0},
    {name: 'magic-resistance', base: 0},
];

export default atts;
