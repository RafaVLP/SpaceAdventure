import type { ShipStats, Location } from './types.ts';

export const calculateCombatPower = (stats: ShipStats): number => {
    const power = 
        (stats.attack * 1.5) +
        (stats.defense * 1.5) +
        (stats.maxIntegrity * 0.2) +
        (stats.speed * 10) +
        (stats.cargo * 0.1) +
        (stats.critChance * 200) +
        ((stats.critDamage - 1.5) * 50) + // Considera o bônus acima de 1.5
        ((stats.luck - 1) * 50) + // Considera o bônus acima de 1.0
        ((stats.miningEfficiency - 1) * 50); // Considera o bônus acima de 1.0
    
    return Math.floor(power);
};

export const calculateWinChance = (shipStats: ShipStats, location: Location): number => {
    if (!shipStats) return 0;
    const playerPower = shipStats.attack + shipStats.defense;
    const locationPower = location.requiredAttack + location.requiredDefense;
    if (locationPower <= 0) return 100;

    const successChance = Math.min(1, playerPower / locationPower);
    return Math.floor(successChance * 100);
};