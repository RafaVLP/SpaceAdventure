



export enum GameStateEnum {
    MainMenu = 'MainMenu',
    Game = 'Game',
    Shop = 'Shop',
    Upgrades = 'Upgrades',
    Inventory = 'Inventory',
    Farm = 'Farm',
    Missions = 'Missions',
    DeepSpace = 'DeepSpace',
    AutoPilot = 'AutoPilot',
}

export type GameState = GameStateEnum;

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type Resources = {
    [key: string]: number;
};

export type PlayerState = {
    level: number;
    xp: number;
    xpToNextLevel: number;
    attributePoints: number;
    shields: number;
};

export type ResourceDefinition = {
    name: string;
    description: string;
    rarity: Rarity;
    baseSellPrice: number;
    value?: number; // For consumables like capsules
};

export type CombatStats = {
    attack: number;
    defense: number;
    critChance: number; // 0 to 1
    critDamage: number; // multiplier, e.g., 1.5
};

export type UtilityStats = {
    speed: number;
    cargo: number;
    miningEfficiency: number; // multiplier, e.g., 1.0
    luck: number; // multiplier for better loot, e.g., 1.0
};

export type ShipCoreStats = {
    integrity: number;
    maxIntegrity: number;
}

export type ShipStats = CombatStats & UtilityStats & ShipCoreStats;
export type ShipStat = keyof ShipStats;


export type Item = {
    id: number;
    name: string;
    description: string;
    rarity: Rarity;
};

export type GachaCapsule = {
    id: string;
    rarity: Rarity;
};

export type Ship = {
    id: string;
    name: string;
    rarity: Rarity;
    baseStats: ShipStats; // The original, unmodified stats
    stats: ShipStats; // The current stats after upgrades
    upgrades: { [upgradeId: string]: number }; // e.g., { 'attack1': 2 }
    combatPower: number;
};

export type UpgradeDefinition = {
    id: string;
    name: string;
    description: string;
    stat: ShipStat;
    value: number; // Percentage increase, e.g., 0.01 for 1%
    cost: { [resourceName: string]: number };
    category: 'Combat' | 'Utility';
};

export type Location = {
    id: number;
    name: string;
    description: string;
    difficulty: number;
    fuelCost: number;
    requiredAttack: number;
    requiredDefense: number;
    rewards: {
        [key: string]: [number, number];
    };
    abundantResources: string[];
    xpReward: number;
    enemyEncounterChance: number;
    environmentalHazard: number; // Chance of taking damage at milestones (0-1)
    itemDrop?: {
        id: string;
        chance: number; // e.g., 0.1 for 10%
    };
    capsuleDropChance: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    image: string;
    emissiveColor?: number;
};

export type DeepSpaceLocation = {
    id: string;
    name: string;
    description: string;
    difficulty: number;
    durationHoursRange: [number, number]; // Min and max duration in hours
    baseXpReward: number;
    rewards: {
        [key: string]: [number, number]; // Base reward per hour
    };
    abundantResources: string[];
    eventChance: number; // Base chance for an event to occur per hour
};

export type RandomEventResult = {
    log: string;
    resourcesGained?: { [key: string]: number };
    itemsGained?: Item[];
    capsuleGained?: GachaCapsule;
    integrityLost?: number;
    xpGained?: number;
};

export type RandomEventSkillCheck = {
    stat: ShipStat;
    difficulty: number;
    success: RandomEventResult;
    failure: RandomEventResult;
};

export type RandomEventOption = {
    text: string;
    description: string;
    cost?: { [key: string]: number };
    result: RandomEventResult | RandomEventSkillCheck;
};

export type RandomEvent = {
    id: string;
    title: string;
    description: string;
    options: RandomEventOption[];
    minDifficulty: number; // Only trigger for locations with at least this difficulty
};


export type Expedition = {
    id: string;
    shipId: string;
    location: Location;
    startTime: number;
    endTime: number;
    startingIntegrity: number;
    currentIntegrity: number;
    log: string[];
    milestones: Set<number>;
    activeEvent: RandomEvent | null;
    isPaused: boolean;
    lastPauseStartTime?: number;
    isAuto?: boolean;
};

export type AutoPilotExpedition = Expedition & {
    isAuto: true;
    locationCycleIndex: number;
};

export type AutoPilotState = {
    remainingTimeMs: number;
    active: boolean;
    shipId: string | null;
    locationIds: number[];
    log: string[];
    lastUpdateTime: number;
    sessionGains: {
        resources: { [key: string]: number };
        xp: number;
        capsules: GachaCapsule[];
    }
};

export type DeepSpaceExpedition = {
    id: string;
    shipId: string;
    location: DeepSpaceLocation;
    startTime: number;
    endTime: number;
};

export type ExpeditionResult = {
    locationName: string;
    resourcesGained: { [key: string]: number };
    itemsGained: Item[] | undefined;
    capsuleGained: GachaCapsule | undefined;
    xpGained: number;
    integrityLost: number;
    combatOutcome: {
        victory: boolean;
        enemyName: string;
        log: string;
        specialLoot?: { [key: string]: number };
        resourcesLost?: { [key: string]: number };
    } | null;
    success: boolean;
    criticalSuccess: boolean;
    combatLog: string;
    isDeepSpace?: boolean;
    deepSpaceEventLog?: string[];
};

// FIX: Added missing Signal type for the SignalScannerScreen component
export type Signal = {
    id: string;
    sequence: number[];
    difficulty: number;
    rewards: { [key:string]: [number, number] };
};

export type FarmPlot = {
    plantId: string | null;
    growthStartTime: number | null;
    growthEndTime: number | null;
};

export type FarmState = {
    unlocked: boolean;
    plots: FarmPlot[][];
    attackLogs: string[];
};

export type PlantDefinition = {
    id: string;
    name: string;
    growthTimeSeconds: number;
    cost: { [resourceName: string]: number };
    yield: { [resourceName: string]: number };
    icon: string;
};

// Mission System Types
export type MissionType = 'COLLECT';

export type MissionObjective = {
    resource: string;
    amount: number;
    description: string;
};

export type MissionReward = {
    credits?: number;
    xp?: number;
    resources?: { [key: string]: number };
    shipBoxes?: number;
};

export type Mission = {
    id: string;
    title: string;
    description: string;
    rarity: Rarity;
    type: MissionType;
    objective: MissionObjective;
    rewards: MissionReward;
};

export type MissionState = {
    availableMissions: Mission[];
    acceptedMissions: Mission[];
    lastMissionRefresh: number;
};