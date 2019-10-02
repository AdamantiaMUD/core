export class EquipmentError extends Error {}
export class EquipSlotTakenError extends EquipmentError {}
export class EquipAlreadyEquippedError extends EquipmentError {}
export class InventoryFullError extends EquipmentError {}
