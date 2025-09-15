import type { Resources, ShipStats, Location, Rarity, ResourceDefinition, UpgradeDefinition, Item, PlayerState, RandomEvent, FarmState, PlantDefinition, MissionState, MissionReward, DeepSpaceLocation, AutoPilotState } from './types';

export const CREDITS = 'credits';
export const FUEL = 'fuel';
export const BIOMASS = 'biomass';

export const AUTO_PILOT_MODULE = 'auto_pilot_module';
export const FUEL_CAPSULE = 'fuel_capsule';
export const REPAIR_CAPSULE = 'repair_capsule';

export const BASE_XP_TO_LEVEL_UP = 100;
export const XP_SCALING_FACTOR = 1.4;

// FIX: Added missing SCANNER_COST constant for SignalScannerScreen component
export const SCANNER_COST: { [key: string]: number } = {
    'silicon': 50,
};

export const SHIP_BOX_BASE_COST = 50000;
export const SHIP_BOX_LEVEL_SCALE = 0.20; // 20% increase per level

export const SHIELD_BASE_COST = 250;
export const SHIELD_LEVEL_SCALE = 0.10; // 10% increase per level
export const MAX_SHIELDS = 5;

export const SHIP_RARITY_CHANCES: { [key in Rarity]: number } = {
    'Common': 0.40,
    'Uncommon': 0.30,
    'Rare': 0.15,
    'Epic': 0.09,
    'Legendary': 0.05,
    'Mythic': 0.01,
};

export const SHIP_STATS_BY_RARITY: { [key in Rarity]: () => ShipStats } = {
    'Common': () => ({
        attack: 5 + Math.floor(Math.random() * 3), // 5-7
        defense: 5 + Math.floor(Math.random() * 3), // 5-7
        maxIntegrity: 100 + Math.floor(Math.random() * 11), // 100-110
        integrity: 110,
        critChance: 0.05,
        critDamage: 1.5,
        speed: 1 + parseFloat((Math.random() * 0.2).toFixed(2)), // 1.0-1.2
        cargo: 100 + Math.floor(Math.random() * 21), // 100-120
        miningEfficiency: 1.0,
        luck: 1.0,
    }),
    'Uncommon': () => ({
        attack: 8 + Math.floor(Math.random() * 4), // 8-11
        defense: 8 + Math.floor(Math.random() * 4), // 8-11
        maxIntegrity: 120 + Math.floor(Math.random() * 21), // 120-140
        integrity: 140,
        critChance: 0.06,
        critDamage: 1.55,
        speed: 1.2 + parseFloat((Math.random() * 0.3).toFixed(2)), // 1.2-1.5
        cargo: 130 + Math.floor(Math.random() * 31), // 130-160
        miningEfficiency: 1.05,
        luck: 1.05,
    }),
    'Rare': () => ({
        attack: 12 + Math.floor(Math.random() * 5), // 12-16
        defense: 12 + Math.floor(Math.random() * 5), // 12-16
        maxIntegrity: 150 + Math.floor(Math.random() * 31), // 150-180
        integrity: 180,
        critChance: 0.07,
        critDamage: 1.6,
        speed: 1.5 + parseFloat((Math.random() * 0.4).toFixed(2)), // 1.5-1.9
        cargo: 170 + Math.floor(Math.random() * 41), // 170-210
        miningEfficiency: 1.1,
        luck: 1.1,
    }),
    'Epic': () => ({
        attack: 18 + Math.floor(Math.random() * 6), // 18-23
        defense: 18 + Math.floor(Math.random() * 6), // 18-23
        maxIntegrity: 200 + Math.floor(Math.random() * 41), // 200-240
        integrity: 240,
        critChance: 0.08,
        critDamage: 1.7,
        speed: 2.0 + parseFloat((Math.random() * 0.5).toFixed(2)), // 2.0-2.5
        cargo: 220 + Math.floor(Math.random() * 51), // 220-270
        miningEfficiency: 1.15,
        luck: 1.15,
    }),
    'Legendary': () => ({
        attack: 25 + Math.floor(Math.random() * 8), // 25-32
        defense: 25 + Math.floor(Math.random() * 8), // 25-32
        maxIntegrity: 250 + Math.floor(Math.random() * 51), // 250-300
        integrity: 300,
        critChance: 0.10,
        critDamage: 1.8,
        speed: 2.5 + parseFloat((Math.random() * 0.6).toFixed(2)), // 2.5-3.1
        cargo: 300 + Math.floor(Math.random() * 61), // 300-360
        miningEfficiency: 1.20,
        luck: 1.25,
    }),
    'Mythic': () => ({
        attack: 35 + Math.floor(Math.random() * 11), // 35-45
        defense: 35 + Math.floor(Math.random() * 11), // 35-45
        maxIntegrity: 350 + Math.floor(Math.random() * 61), // 350-410
        integrity: 410,
        critChance: 0.12,
        critDamage: 2.0,
        speed: 3.2 + parseFloat((Math.random() * 0.8).toFixed(2)), // 3.2-4.0
        cargo: 400 + Math.floor(Math.random() * 101), // 400-500
        miningEfficiency: 1.30,
        luck: 1.40,
    }),
};

export const RESOURCE_DEFINITIONS: { [key:string]: ResourceDefinition } = {
    'iron': { name: 'Ferro', description: 'Um metal comum, essencial para construções básicas.', rarity: 'Common', baseSellPrice: 2 },
    'copper': { name: 'Cobre', description: 'Usado em componentes eletrônicos simples.', rarity: 'Common', baseSellPrice: 3 },
    'silicon': { name: 'Silício', description: 'Fundamental para a fabricação de computadores de bordo.', rarity: 'Common', baseSellPrice: 3 },
    'titanium': { name: 'Titânio', description: 'Leve e resistente, usado em blindagens.', rarity: 'Uncommon', baseSellPrice: 8 },
    'gold': { name: 'Ouro', description: 'Excelente condutor, valioso em tecnologia avançada.', rarity: 'Uncommon', baseSellPrice: 15 },
    'platinum': { name: 'Platina', description: 'Raro e estável, usado em sistemas de navegação.', rarity: 'Rare', baseSellPrice: 25 },
    'uranium': { name: 'Urânio', description: 'Fonte de energia para reatores de alta performance.', rarity: 'Rare', baseSellPrice: 30 },
    'quantonium': { name: 'Quantônio', description: 'Um cristal exótico que dobra o espaço-tempo.', rarity: 'Epic', baseSellPrice: 75 },
    'zypherite': { name: 'Ziferita', description: 'Um gás raro que otimiza a eficiência dos propulsores.', rarity: 'Epic', baseSellPrice: 80 },
    'singularity_core': { name: 'Núcleo de Singularidade', description: 'Um fragmento de um buraco negro colapsado. Poder imensurável.', rarity: 'Legendary', baseSellPrice: 500 },
    'alien_alloy': { name: 'Liga Alienígena', description: 'Fragmentos de tecnologia inimiga, podem ser reconfigurados.', rarity: 'Rare', baseSellPrice: 40 },
    [BIOMASS]: { name: 'Biomassa', description: 'Matéria orgânica cultivada, usada para fins industriais e energéticos.', rarity: 'Common', baseSellPrice: 1 },
    [AUTO_PILOT_MODULE]: { name: 'Módulo de Autopilotagem', description: 'Concede 1 hora de tempo de expedição automatizada.', rarity: 'Epic', baseSellPrice: 0, value: 3600 * 1000 },
    [FUEL_CAPSULE]: { name: 'Cápsula de Combustível', description: 'Recarrega instantaneamente 50 unidades de combustível.', rarity: 'Uncommon', baseSellPrice: 0, value: 50 },
    [REPAIR_CAPSULE]: { name: 'Cápsula de Reparo', description: 'Repara instantaneamente 50 pontos de integridade do casco.', rarity: 'Uncommon', baseSellPrice: 0, value: 50 },
};

export const ITEMS: { [id: string]: Item } = {
    'artifact_kren': { id: 1, name: 'Artefato Kren', description: 'Um dispositivo antigo que pulsa com energia desconhecida. Parece ressoar com os motores da nave.', rarity: 'Rare' },
    'crystal_solaris': { id: 2, name: 'Cristal Solaris', description: 'Um cristal que armazena a luz de mil sóis. Pode ser usado para focar raios de energia.', rarity: 'Epic' },
    'datapad_lost': { id: 3, name: 'Datapad Perdido', description: 'Contém fragmentos de mapas estelares que levam a rotas secretas e eficientes.', rarity: 'Uncommon' },
    'engine_booster_mk1': { id: 4, name: 'Módulo de Propulsão Mk1', description: 'Um propulsor auxiliar de uso único que pode ser adaptado para melhorar a eficiência.', rarity: 'Uncommon' },
    'shield_modulator': { id: 5, name: 'Modulador de Escudo', description: 'Tecnologia de vanguarda que re-calibra a frequência do escudo para maior resistência.', rarity: 'Rare' },
    'singularity_shard': { id: 6, name: 'Fragmento de Singularidade', description: 'Um eco instável do item mais raro do universo. Possui um poder latente.', rarity: 'Legendary' },
};

export const RARITY_SELL_VALUES: { [key in Rarity]: number } = {
    'Common': 50,
    'Uncommon': 150,
    'Rare': 400,
    'Epic': 1000,
    'Legendary': 5000,
    'Mythic': 15000,
};

export const CAPSULE_CONTENTS_BY_RARITY: {
  [key in Rarity]: {
    pulls: number;
    resourcePool: { [resourceName: string]: [number, number] };
  }
} = {
    'Common': {
        pulls: 2,
        resourcePool: { 'iron': [25, 75], 'copper': [20, 60], 'silicon': [20, 60] },
    },
    'Uncommon': {
        pulls: 3,
        resourcePool: { 'iron': [50, 100], 'copper': [40, 80], 'silicon': [40, 80], 'titanium': [15, 40], 'gold': [10, 30] },
    },
    'Rare': {
        pulls: 3,
        resourcePool: { 'titanium': [30, 75], 'gold': [20, 50], 'platinum': [10, 30], 'uranium': [5, 20] },
    },
    'Epic': {
        pulls: 4,
        resourcePool: { 'platinum': [25, 60], 'uranium': [20, 50], 'quantonium': [5, 15], 'zypherite': [5, 15] },
    },
    'Legendary': {
        pulls: 4,
        resourcePool: { 'quantonium': [15, 30], 'zypherite': [15, 30], 'singularity_core': [1, 2] },
    },
    'Mythic': {
        pulls: 5,
        resourcePool: { 'quantonium': [25, 50], 'zypherite': [25, 50], 'singularity_core': [2, 5] },
    },
};

export const ENEMIES: { [key: string]: { name: string; attack: number; defense: number; rewards: { [key: string]: [number, number] } } } = {
    'pirate_scout': { name: 'Batedor Pirata', attack: 8, defense: 5, rewards: { 'alien_alloy': [1, 2], 'iron': [10, 30] } },
    'void_leech': { name: 'Sanguessuga do Vazio', attack: 15, defense: 8, rewards: { 'alien_alloy': [2, 4] } },
    'cyborg_marauder': { name: 'Saqueador Ciborgue', attack: 30, defense: 25, rewards: { 'alien_alloy': [5, 10], 'titanium': [5, 15] } },
    'ancient_drone': { name: 'Drone Antigo', attack: 55, defense: 50, rewards: { 'alien_alloy': [10, 15], 'quantonium': [1, 2] } },
};


export const INITIAL_RESOURCES: Resources = {
    [CREDITS]: 1000,
    [FUEL]: 100,
    'iron': 50,
    'copper': 25,
};

export const INITIAL_PLAYER_STATE: PlayerState = {
    level: 1,
    xp: 0,
    xpToNextLevel: BASE_XP_TO_LEVEL_UP,
    attributePoints: 0,
    shields: 0,
};

export const INITIAL_AUTO_PILOT_STATE: AutoPilotState = {
    remainingTimeMs: 0,
    active: false,
    shipId: null,
    locationIds: [],
    log: [],
    lastUpdateTime: 0,
    sessionGains: {
        resources: {},
        xp: 0,
        capsules: [],
    }
};

export const INITIAL_SHIP_STATS: ShipStats = {
    attack: 5,
    defense: 5,
    integrity: 100,
    maxIntegrity: 100,
    critChance: 0.05,
    critDamage: 1.5,
    speed: 1,
    cargo: 100,
    miningEfficiency: 1.0,
    luck: 1.0,
};

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: 'distress_call',
        title: 'Sinal de Socorro',
        description: 'Você detecta um sinal de socorro vindo de uma nave cargueira danificada. Eles estão pedindo ajuda e oferecem uma recompensa.',
        minDifficulty: 1,
        options: [
            {
                text: 'Ajudar',
                description: 'Gasta um pouco de combustível para chegar até eles, mas pode valer a pena.',
                cost: { [FUEL]: 5 },
                result: {
                    log: 'Você ajuda a tripulação do cargueiro. Em agradecimento, eles transferem alguns recursos para sua nave.',
                    resourcesGained: { [CREDITS]: 150, 'titanium': 10 },
                    xpGained: 15,
                }
            },
            {
                text: 'Ignorar',
                description: 'É muito arriscado se desviar do curso. Melhor seguir em frente.',
                result: {
                    log: 'Você decide ignorar o sinal de socorro e continuar sua expedição.'
                }
            }
        ]
    },
    {
        id: 'pirate_ambush',
        title: 'Emboscada Pirata',
        description: 'Uma pequena nave pirata surge das sombras de um asteroide, bloqueando seu caminho. Eles exigem um pagamento ou enfrentarão as consequências.',
        minDifficulty: 3,
        options: [
            {
                text: 'Lutar!',
                description: 'Teste suas armas contra os piratas. (Requer Ataque)',
                result: {
                    stat: 'attack',
                    difficulty: 20,
                    success: {
                        log: 'Você derrota os piratas e saqueia seus destroços!',
                        resourcesGained: { 'alien_alloy': 5, [CREDITS]: 200 },
                        xpGained: 25,
                    },
                    failure: {
                        log: 'Os piratas eram mais fortes. Eles danificaram sua nave e roubaram alguns créditos antes de fugir.',
                        resourcesGained: { [CREDITS]: -100 },
                        integrityLost: 15,
                        xpGained: 5,
                    }
                }
            },
            {
                text: 'Pagar',
                description: 'Pague 100 créditos para evitar problemas.',
                cost: { [CREDITS]: 100 },
                result: {
                    log: 'Você paga os piratas e eles o deixam passar em paz. Covarde, mas seguro.'
                }
            },
            {
                text: 'Fugir',
                description: 'Tente usar seus motores para escapar. (Requer Velocidade)',
                result: {
                    stat: 'speed',
                    difficulty: 3,
                    success: {
                        log: 'Você consegue despistar os piratas com uma manobra ágil!',
                        xpGained: 10,
                    },
                    failure: {
                        log: 'A nave pirata é rápida! Eles conseguem acertar alguns tiros enquanto você foge.',
                        integrityLost: 10,
                    }
                }
            }
        ]
    },
    {
        id: 'derelict_ship',
        title: 'Nave à Deriva',
        description: 'Seus sensores de longo alcance detectam uma nave antiga flutuando silenciosamente no espaço. Pode haver algo valioso a bordo, mas também pode ser perigoso.',
        minDifficulty: 2,
        options: [
            {
                text: 'Investigar e Salvar',
                description: 'Envie uma equipe para investigar. Requer alguma habilidade de defesa para navegar pelos destroços.',
                result: {
                    stat: 'defense',
                    difficulty: 15,
                    success: {
                        log: 'Sua equipe navega com sucesso pelos destroços e recupera um contêiner de carga intacto.',
                        resourcesGained: { 'gold': 20, 'silicon': 50, 'alien_alloy': 2 },
                        xpGained: 20,
                    },
                    failure: {
                        log: 'A estrutura da nave era instável! Uma pequena explosão danifica seu casco durante a operação.',
                        integrityLost: 20,
                        xpGained: 5,
                    }
                }
            },
            {
                text: 'Deixar para trás',
                description: 'Não vale o risco. Continue a viagem.',
                result: {
                    log: 'Você marca a localização da nave à deriva e continua sua rota.'
                }
            }
        ]
    }
];


export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
    // Utility
    { id: 'speed1', name: 'Propulsor Químico Melhorado', description: 'Aumenta a velocidade base em 5%.', stat: 'speed', value: 0.05, cost: { 'iron': 100, 'copper': 50 }, category: 'Utility' },
    { id: 'speed2', name: 'Propulsor de Íons', description: 'Aumenta a velocidade base em 10%.', stat: 'speed', value: 0.10, cost: { 'titanium': 75, 'silicon': 100, 'gold': 20 }, category: 'Utility' },
    { id: 'speed3', name: 'Motor de Dobra Básico', description: 'Aumenta a velocidade base em 20%.', stat: 'speed', value: 0.20, cost: { 'platinum': 50, 'uranium': 25, 'zypherite': 10 }, category: 'Utility' },
    { id: 'cargo1', name: 'Expansão de Carga Simples', description: 'Aumenta a carga base em 10%.', stat: 'cargo', value: 0.10, cost: { 'iron': 200 }, category: 'Utility' },
    { id: 'cargo2', name: 'Contêineres Reforçados', description: 'Aumenta a carga base em 20%.', stat: 'cargo', value: 0.20, cost: { 'iron': 250, 'titanium': 100 }, category: 'Utility' },
    { id: 'mining1', name: 'Otimizador de Feixe', description: 'Aumenta a eficiência de mineração base em 10%.', stat: 'miningEfficiency', value: 0.1, cost: { 'copper': 150, 'silicon': 120 }, category: 'Utility' },
    { id: 'luck1', name: 'Módulo de Sorte', description: 'Aumenta a sorte base em 10%.', stat: 'luck', value: 0.1, cost: { 'gold': 100, 'platinum': 40 }, category: 'Utility' },

    // Combat
    { id: 'attack1', name: 'Laser de Mineração', description: 'Aumenta o ataque base em 2%.', stat: 'attack', value: 0.02, cost: { 'iron': 75, 'copper': 75, 'silicon': 50 }, category: 'Combat' },
    { id: 'attack2', name: 'Canhão de Plasma', description: 'Aumenta o ataque base em 4%.', stat: 'attack', value: 0.04, cost: { 'titanium': 100, 'gold': 50, 'uranium': 10 }, category: 'Combat' },
    { id: 'defense1', name: 'Gerador de Escudo Básico', description: 'Aumenta a defesa base em 2%.', stat: 'defense', value: 0.02, cost: { 'iron': 150, 'silicon': 75 }, category: 'Combat' },
    { id: 'defense2', name: 'Escudo Defletor', description: 'Aumenta a defesa base em 4%.', stat: 'defense', value: 0.04, cost: { 'titanium': 120, 'platinum': 25 }, category: 'Combat' },
    { id: 'integrity1', name: 'Blindagem de Casco', description: 'Aumenta a integridade máxima base em 5%.', stat: 'maxIntegrity', value: 0.05, cost: { 'titanium': 150, 'alien_alloy': 10 }, category: 'Combat' },
    { id: 'crit1', name: 'Focalizador de Cristal', description: 'Aumenta a chance de crítico base em 2%.', stat: 'critChance', value: 0.02, cost: { 'alien_alloy': 20, 'quantonium': 5 }, category: 'Combat' },
];

export const LOCATIONS: Location[] = [
    { id: 1, name: 'Anel de Themis', description: 'Um cinturão de asteroides denso e rico em metais básicos.', difficulty: 1, fuelCost: 5, requiredAttack: 5, requiredDefense: 5, xpReward: 10, enemyEncounterChance: 0.1, environmentalHazard: 0.2, rewards: { 'iron': [20, 40], 'copper': [10, 30] }, abundantResources: ['iron', 'copper'], capsuleDropChance: 0.25, position: { x: -60, y: 5, z: 40 }, image: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 2, name: 'Xylos', description: 'Um planeta rochoso com uma crosta rica em silício e titânio.', difficulty: 2, fuelCost: 10, requiredAttack: 10, requiredDefense: 8, xpReward: 20, enemyEncounterChance: 0.15, environmentalHazard: 0.1, rewards: { 'silicon': [20, 50], 'titanium': [10, 25] }, abundantResources: ['silicon', 'titanium'], itemDrop: { id: 'datapad_lost', chance: 0.05 }, capsuleDropChance: 0.3, position: { x: 80, y: -10, z: -30 }, image: 'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 3, name: 'Aglomerado H-4', description: 'Uma região caótica, mas rica em Ouro e Titânio. Requer escudos potentes.', difficulty: 3, fuelCost: 12, requiredAttack: 15, requiredDefense: 18, xpReward: 35, enemyEncounterChance: 0.25, environmentalHazard: 0.3, rewards: { 'gold': [15, 25], 'titanium': [25, 40] }, abundantResources: ['gold', 'titanium'], capsuleDropChance: 0.3, position: { x: -120, y: -15, z: 10 }, image: 'https://images.pexels.com/photos/176851/pexels-photo-176851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 4, name: 'Nidia', description: 'Um planeta oceânico com vida bioluminescente, cujas marés revelam depósitos de Platina.', difficulty: 4, fuelCost: 15, requiredAttack: 20, requiredDefense: 15, xpReward: 50, enemyEncounterChance: 0.1, environmentalHazard: 0.1, rewards: { 'platinum': [8, 18], 'silicon': [30, 60] }, abundantResources: ['platinum', 'silicon'], capsuleDropChance: 0.35, position: { x: 40, y: -30, z: 90 }, image: 'https://images.pexels.com/photos/41951/earth-blue-planet-globe-planet-41951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0x0055ff },
    { id: 5, name: 'Gigante Gasoso Kepler', description: 'Sua atmosfera volátil contém bolsões de Ziferita.', difficulty: 5, fuelCost: 20, requiredAttack: 25, requiredDefense: 20, xpReward: 70, enemyEncounterChance: 0.2, environmentalHazard: 0.25, rewards: { 'zypherite': [2, 5] }, abundantResources: ['zypherite'], capsuleDropChance: 0.4, position: { x: -100, y: 25, z: -80 }, image: 'https://images.pexels.com/photos/5439/earth-space.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 6, name: 'O Cemitério', description: 'Destroços de uma antiga batalha. Rico em metais raros, mas perigoso.', difficulty: 6, fuelCost: 25, requiredAttack: 35, requiredDefense: 30, xpReward: 90, enemyEncounterChance: 0.5, environmentalHazard: 0.4, rewards: { 'titanium': [20, 40], 'gold': [10, 20], 'platinum': [5, 15] }, abundantResources: ['titanium', 'gold', 'platinum'], itemDrop: { id: 'shield_modulator', chance: 0.1 }, capsuleDropChance: 0.5, position: { x: 150, y: 0, z: 100 }, image: 'https://images.pexels.com/photos/73910/mars-mars-rover-space-travel-robot-73910.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 7, name: 'Planeta Forja', description: 'Um mundo vulcânico onde metais raros são expelidos para a superfície. O calor é extremo.', difficulty: 7, fuelCost: 30, requiredAttack: 40, requiredDefense: 40, xpReward: 120, enemyEncounterChance: 0.3, environmentalHazard: 0.5, rewards: { 'uranium': [3, 8], 'gold': [20, 35], 'titanium': [30, 50] }, abundantResources: ['uranium', 'gold', 'titanium'], capsuleDropChance: 0.55, position: { x: 20, y: 15, z: -110 }, image: 'https://images.pexels.com/photos/3224164/pexels-photo-3224164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0xff4400 },
    { id: 8, name: 'Lua de Cygnus X-1', description: 'Uma lua instável orbitando um buraco negro. Fonte de Urânio.', difficulty: 8, fuelCost: 35, requiredAttack: 50, requiredDefense: 45, xpReward: 150, enemyEncounterChance: 0.6, environmentalHazard: 0.6, rewards: { 'uranium': [5, 10], 'platinum': [3, 8] }, abundantResources: ['uranium', 'platinum'], itemDrop: { id: 'artifact_kren', chance: 0.15 }, capsuleDropChance: 0.6, position: { x: 90, y: 40, z: 120 }, image: 'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0x99ff99 },
    { id: 9, name: 'Vórtice Sombrio', description: 'Uma nebulosa densa que esconde cristais de Quantônio, mas interfere nos sensores.', difficulty: 9, fuelCost: 40, requiredAttack: 60, requiredDefense: 55, xpReward: 200, enemyEncounterChance: 0.75, environmentalHazard: 0.7, rewards: { 'quantonium': [2, 4], 'zypherite': [5, 10] }, abundantResources: ['quantonium', 'zypherite'], itemDrop: { id: 'singularity_shard', chance: 0.05 }, capsuleDropChance: 0.7, position: { x: -150, y: 50, z: 50 }, image: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 10, name: 'Coração do Nexus', description: 'Uma anomalia quântica cristalizada. Extremamente rara e perigosa.', difficulty: 10, fuelCost: 50, requiredAttack: 70, requiredDefense: 60, xpReward: 300, enemyEncounterChance: 0.9, environmentalHazard: 0.8, rewards: { 'quantonium': [1, 3], 'singularity_core': [0, 1] }, abundantResources: ['quantonium', 'singularity_core'], itemDrop: { id: 'crystal_solaris', chance: 0.2 }, capsuleDropChance: 0.75, position: { x: 0, y: 60, z: 0 }, image: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0xffaa00 },
    { id: 11, name: 'Campos Cristalinos', description: 'Um planetoide coberto por formações cristalinas que contêm Ziferita pura.', difficulty: 11, fuelCost: 55, requiredAttack: 75, requiredDefense: 70, xpReward: 350, enemyEncounterChance: 0.8, environmentalHazard: 0.6, rewards: { 'zypherite': [10, 20], 'quantonium': [1, 2] }, abundantResources: ['zypherite', 'quantonium'], capsuleDropChance: 0.8, position: { x: -200, y: -40, z: -150 }, image: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0xaa55ff },
    { id: 12, name: 'Anomalia K-17', description: 'Uma fenda no espaço-tempo, perigosa, mas com potencial para encontrar Ligas Alienígenas raras.', difficulty: 12, fuelCost: 60, requiredAttack: 80, requiredDefense: 80, xpReward: 400, enemyEncounterChance: 0.95, environmentalHazard: 0.8, rewards: { 'alien_alloy': [10, 25], 'platinum': [10, 20] }, abundantResources: ['alien_alloy', 'platinum'], capsuleDropChance: 0.85, position: { x: 200, y: 60, z: -50 }, image: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 13, name: 'Mundo-Colmeia Tyran', description: 'Um planeta orgânico abandonado. Sua crosta é feita de biomassa antiga e ligas exóticas.', difficulty: 13, fuelCost: 65, requiredAttack: 90, requiredDefense: 85, xpReward: 450, enemyEncounterChance: 0.85, environmentalHazard: 0.7, rewards: { 'biomass': [500, 1500], 'alien_alloy': [15, 30] }, abundantResources: ['biomass', 'alien_alloy'], capsuleDropChance: 0.9, position: { x: -80, y: 80, z: 180 }, image: 'https://images.pexels.com/photos/32237/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0x55ff55 },
    { id: 14, name: 'O Olho do Kraken', description: 'Uma tempestade hiper-gigante em um planeta gasoso, onde Núcleos de Singularidade se formam.', difficulty: 14, fuelCost: 75, requiredAttack: 100, requiredDefense: 100, xpReward: 550, enemyEncounterChance: 1.0, environmentalHazard: 0.9, rewards: { 'singularity_core': [1, 2], 'zypherite': [15, 30] }, abundantResources: ['singularity_core', 'zypherite'], itemDrop: { id: 'singularity_shard', chance: 0.15 }, capsuleDropChance: 0.95, position: { x: 180, y: -60, z: 200 }, image: 'https://images.pexels.com/photos/624015/pexels-photo-624015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 15, name: 'Galáxia Fantasma', description: 'Uma região de matéria escura. Apenas as naves mais poderosas ousam entrar.', difficulty: 15, fuelCost: 100, requiredAttack: 120, requiredDefense: 120, xpReward: 700, enemyEncounterChance: 1.0, environmentalHazard: 1.0, rewards: { 'singularity_core': [2, 4], 'quantonium': [10, 20] }, abundantResources: ['singularity_core', 'quantonium'], capsuleDropChance: 1.0, position: { x: 0, y: -80, z: -250 }, image: 'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', emissiveColor: 0xaaaaff },
];

// --- Deep Space AFK Expeditions ---
export const DEEP_SPACE_LOCATIONS: DeepSpaceLocation[] = [
    {
        id: 'ds_01',
        name: 'Patrulha do Setor Remoto',
        description: 'Uma patrulha de longa duração através de um setor pouco explorado. Baixo risco, recompensas consistentes.',
        difficulty: 5,
        durationHoursRange: [1, 4],
        baseXpReward: 100,
        rewards: { 'iron': [100, 200], 'copper': [80, 160], 'silicon': [80, 160], 'titanium': [20, 40] },
        abundantResources: ['iron', 'copper', 'silicon', 'titanium'],
        eventChance: 0.1,
    },
    {
        id: 'ds_02',
        name: 'Escavação em Campo de Batalha',
        description: 'Uma operação de salvamento nos destroços de uma guerra antiga. Requer uma nave robusta.',
        difficulty: 8,
        durationHoursRange: [4, 12],
        baseXpReward: 250,
        rewards: { 'titanium': [50, 100], 'gold': [30, 60], 'platinum': [20, 40], 'alien_alloy': [10, 20] },
        abundantResources: ['titanium', 'gold', 'platinum', 'alien_alloy'],
        eventChance: 0.25,
    },
    {
        id: 'ds_03',
        name: 'Observação de Nebulosa',
        description: 'Uma expedição científica para coletar gases raros e dados de uma nebulosa volátil.',
        difficulty: 12,
        durationHoursRange: [8, 24],
        baseXpReward: 600,
        rewards: { 'uranium': [25, 50], 'quantonium': [15, 30], 'zypherite': [20, 40] },
        abundantResources: ['uranium', 'quantonium', 'zypherite'],
        eventChance: 0.4,
    },
];

// --- Farm Constants ---
export const INITIAL_FARM_STATE: FarmState = {
    unlocked: false,
    plots: Array(5).fill(null).map(() => 
        Array(5).fill({ 
            plantId: null, 
            growthStartTime: null,
            growthEndTime: null 
        })
    ),
    attackLogs: [],
};

export const PLANTS: { [id: string]: PlantDefinition } = {
    'bio_fungus': {
        id: 'bio_fungus',
        name: 'Bio-Fungo',
        growthTimeSeconds: 60,
        cost: { [CREDITS]: 25 },
        yield: { [BIOMASS]: 10 },
        icon: '🍄',
    },
};

// --- Mission Constants ---
export const MAX_ACCEPTED_MISSIONS = 3;
export const MISSION_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const INITIAL_MISSION_STATE: MissionState = {
    availableMissions: [],
    acceptedMissions: [],
    lastMissionRefresh: 0,
};

type MissionTemplate = {
    title: string[];
    objective: {
        resources: string[];
        amountRange: [number, number];
    };
    rewards: {
        creditsRange: [number, number];
        xpRange: [number, number];
        resources?: { pool: string[], amountRange: [number, number] };
        shipBoxChance?: number;
    };
};

export const MISSION_TEMPLATES: { [key in Rarity]: MissionTemplate } = {
    'Common': {
        title: ["Coleta de Sucata", "Pedido de Mineração", "Suprimentos Essenciais"],
        objective: {
            resources: ['iron', 'copper', 'silicon'],
            amountRange: [50, 150],
        },
        rewards: {
            creditsRange: [100, 300],
            xpRange: [10, 25],
        }
    },
    'Uncommon': {
        title: ["Contrato de Blindagem", "Pedido de Condutores", "Carga Valiosa"],
        objective: {
            resources: ['titanium', 'gold'],
            amountRange: [25, 75],
        },
        rewards: {
            creditsRange: [500, 1200],
            xpRange: [30, 60],
            resources: { pool: ['iron', 'copper', 'silicon'], amountRange: [50, 100] }
        }
    },
    'Rare': {
        title: ["Necessidade Energética", "Componentes de Navegação", "Requisição Rara"],
        objective: {
            resources: ['platinum', 'uranium', 'alien_alloy'],
            amountRange: [15, 40],
        },
        rewards: {
            creditsRange: [2000, 4000],
            xpRange: [75, 150],
            resources: { pool: ['titanium', 'gold'], amountRange: [20, 40] }
        }
    },
    'Epic': {
        title: ["Pesquisa de Dobra Espacial", "Otimização de Propulsor", "Demanda Exótica"],
        objective: {
            resources: ['quantonium', 'zypherite'],
            amountRange: [10, 25],
        },
        rewards: {
            creditsRange: [8000, 15000],
            xpRange: [200, 400],
            resources: { pool: ['platinum', 'uranium'], amountRange: [10, 25] },
            shipBoxChance: 0.25, // 25% chance of a ship box
        }
    },
    'Legendary': {
        title: ["A Anomalia", "Contenção de Singularidade", "O Projeto Final"],
        objective: {
            resources: ['singularity_core'],
            amountRange: [1, 3],
        },
        rewards: {
            creditsRange: [30000, 75000],
            xpRange: [500, 1000],
            resources: { pool: ['quantonium', 'zypherite'], amountRange: [10, 20] },
            shipBoxChance: 1, // Guaranteed ship box
        }
    },
    'Mythic': {
        title: ["Eco do Vazio", "Paradoxo Cósmico"],
        objective: {
            resources: ['singularity_core'],
            amountRange: [5, 10],
        },
        rewards: {
            creditsRange: [100000, 250000],
            xpRange: [2000, 5000],
            resources: { pool: ['singularity_core'], amountRange: [1, 2] },
            shipBoxChance: 1,
        }
    }
};