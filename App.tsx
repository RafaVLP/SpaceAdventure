
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

import { GameScreen } from './components/GameScreen.tsx';
import { ShopScreen } from './components/GachaScreen.tsx';
import { UpgradeScreen } from './components/UpgradeScreen.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { Header } from './components/Header.tsx';
import { InventoryScreen } from './components/InventoryScreen.tsx';
import { FarmScreen } from './components/FarmScreen.tsx';
import { MissionScreen } from './components/MissionScreen.tsx';
import { DeepSpaceScreen } from './components/DeepSpaceScreen.tsx';
import { AutoPilotScreen } from './components/AutoPilotScreen.tsx';
import type { GameState, Resources, ShipStats, Item, Location, Expedition, ExpeditionResult, GachaCapsule, Rarity, PlayerState, ShipStat, RandomEventOption, RandomEventResult, RandomEventSkillCheck, FarmState, Ship, FarmPlot, MissionState, Mission, MissionReward, DeepSpaceExpedition, DeepSpaceLocation, AutoPilotState, AutoPilotExpedition, RandomEvent } from './types.ts';
import { GameStateEnum } from './types.ts';
import { LOCATIONS, INITIAL_RESOURCES, FUEL, CREDITS, RESOURCE_DEFINITIONS, UPGRADE_DEFINITIONS, ITEMS, RARITY_SELL_VALUES, CAPSULE_CONTENTS_BY_RARITY, INITIAL_PLAYER_STATE, BASE_XP_TO_LEVEL_UP, XP_SCALING_FACTOR, ENEMIES, RANDOM_EVENTS, INITIAL_FARM_STATE, PLANTS, SHIP_RARITY_CHANCES, SHIP_STATS_BY_RARITY, MAX_SHIELDS, SHIP_BOX_BASE_COST, SHIP_BOX_LEVEL_SCALE, SHIELD_BASE_COST, SHIELD_LEVEL_SCALE, INITIAL_MISSION_STATE, MISSION_REFRESH_INTERVAL_MS, MAX_ACCEPTED_MISSIONS, MISSION_TEMPLATES, DEEP_SPACE_LOCATIONS, FUEL_CAPSULE, REPAIR_CAPSULE, INITIAL_AUTO_PILOT_STATE } from './constants.ts';
import { calculateCombatPower } from './utils.ts';

const SHIP_PREFIXES = ['Stellar', 'Void', 'Nova', 'Astro', 'Cosmic', 'Orion', 'Pegasus', 'Andromeda'];
const SHIP_SUFFIXES = ['Voyager', 'Drifter', 'Explorer', 'Interceptor', 'Javelin', 'Harbinger', 'Comet', 'Pioneer'];
const MYTHIC_NAMES = ['The Unraveler', 'Omen of the Stars', 'Silence of the Void', 'Event Horizon', 'The Singularity'];

function generateShipName(rarity: Rarity): string {
    if (rarity === 'Mythic' && Math.random() < 0.8) {
        return MYTHIC_NAMES[Math.floor(Math.random() * MYTHIC_NAMES.length)];
    }
    const prefix = SHIP_PREFIXES[Math.floor(Math.random() * SHIP_PREFIXES.length)];
    const suffix = SHIP_SUFFIXES[Math.floor(Math.random() * SHIP_SUFFIXES.length)];
    return `${prefix} ${suffix}`;
}


const CapsuleResultModal: React.FC<{ results: { [key: string]: number }; rarity: Rarity; onClose: () => void }> = ({ results, rarity, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in-up p-4" onClick={onClose}>
        <div 
            className={`ui-panel relative w-full max-w-md text-center rarity-${rarity} flex flex-col border-2 border-rarity shadow-rarity`}
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-6 pb-2 relative flex-shrink-0">
                 <h2 className="text-3xl font-bold font-title uppercase" style={{color: 'var(--rarity-color)', textShadow: '0 0 8px var(--rarity-color)'}}>Cápsula {rarity}</h2>
                 <p className={`font-semibold text-lg`}>Conteúdo do Contêiner:</p>
            </div>

            <div className="overflow-y-auto px-6 py-4 flex-grow min-h-0">
                <div className="space-y-3 bg-black/30 p-4" style={{clipPath: 'polygon(0 5px, 5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px))'}}>
                    {Object.entries(results).map(([key, value], index) => (
                        <div key={key} className="flex justify-between items-center text-lg animate-resource-gain" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                            <span className="font-semibold text-cyan-300">{(RESOURCE_DEFINITIONS[key]?.name || key)}</span>
                            <span className="font-bold text-white text-xl">+{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4">
                <button onClick={onClose} className="ui-button active w-full">Confirmar</button>
            </div>
        </div>
    </div>
);

const ShipResultModal: React.FC<{ ship: Ship; onClose: () => void }> = ({ ship, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in-up p-4" onClick={onClose}>
        <div 
            className={`ui-panel relative w-full max-w-md text-center rarity-${ship.rarity} flex flex-col border-2 border-rarity shadow-rarity`}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold font-title uppercase tracking-wider" style={{color: 'var(--rarity-color)', textShadow: '0 0 8px var(--rarity-color)'}}>Transmissão Recebida</h2>
                <p className="text-slate-300">Nova nave designada para a frota.</p>
                <p className={`font-bold font-title text-3xl my-3 rarity-${ship.rarity}`}>{ship.name}</p>
                <p className={`font-semibold text-lg rarity-${ship.rarity} mb-4`}>Classe: {ship.rarity}</p>
                
                <div className="text-4xl font-bold font-title text-yellow-400 my-4 py-2 border-y-2" style={{borderColor: 'var(--rarity-color)', textShadow: '0 0 10px var(--color-secondary)'}}>
                    ⚡ {ship.combatPower} <span className="text-xl text-yellow-500">Poder de Combate</span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 text-left my-4 bg-black/30 p-4 text-lg" style={{clipPath: 'polygon(0 5px, 5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px))'}}>
                    <p>⚔️ Ataque: <span className="font-bold text-white">{ship.stats.attack}</span></p>
                    <p>🛡️ Defesa: <span className="font-bold text-white">{ship.stats.defense}</span></p>
                    <p>❤️ Integridade: <span className="font-bold text-white">{ship.stats.maxIntegrity}</span></p>
                    <p>🚀 Velocidade: <span className="font-bold text-white">{ship.stats.speed.toFixed(1)}</span></p>
                    <p>📦 Carga: <span className="font-bold text-white">{ship.stats.cargo}</span></p>
                    <p>🍀 Sorte: <span className="font-bold text-white">{ship.stats.luck.toFixed(2)}</span></p>
                </div>
                <button onClick={onClose} className="ui-button active w-full mt-2">Registrar na Frota</button>
            </div>
        </div>
    </div>
);

const FarmUnlockModal: React.FC<{ onConfirm: () => void; cost: number }> = ({ onConfirm, cost }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in-up p-4">
        <div className="ui-panel w-full max-w-sm text-center p-8">
            <h2 className="text-2xl font-bold font-title text-cyan-400 mb-4">DESBLOQUEAR BIODOMO</h2>
            <p className="text-slate-300 mb-6">Autorizar a construção de uma colônia agrícola na base para cultivar Biomassa e outros recursos orgânicos.</p>
            <p className="font-bold text-yellow-400 text-xl mb-6">Custo: {cost} Créditos</p>
            <div className="flex justify-center gap-4">
                <button onClick={onConfirm} className="ui-button active px-6">Autorizar</button>
            </div>
        </div>
    </div>
);

const SAVE_KEY = 'gachaSpaceFarmSave_1.5.0';
const SAVE_VERSION = '1.5.0'; // Version with Firebase Auth removed

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameStateEnum.MainMenu);
    const [resources, setResources] = useState<Resources>(INITIAL_RESOURCES);
    const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
    const [inventory, setInventory] = useState<Item[]>([]);
    const [capsules, setCapsules] = useState<GachaCapsule[]>([]);
    const [ships, setShips] = useState<Ship[]>([]);
    const [activeShipId, setActiveShipId] = useState<string | null>(null);
    const [defendingShipId, setDefendingShipId] = useState<string | null>(null);
    const [shipBoxes, setShipBoxes] = useState(1);
    
    const [missionState, setMissionState] = useState<MissionState>(INITIAL_MISSION_STATE);

    const [activeExpeditions, setActiveExpeditions] = useState<Expedition[]>([]);
    const [activeDeepSpaceExpeditions, setActiveDeepSpaceExpeditions] = useState<DeepSpaceExpedition[]>([]);
    const [expeditionResult, setExpeditionResult] = useState<ExpeditionResult | null>(null);
    const [capsuleResult, setCapsuleResult] = useState<{ results: { [key: string]: number }; rarity: Rarity } | null>(null);
    const [shipResult, setShipResult] = useState<Ship | null>(null);

    const [currentTime, setCurrentTime] = useState(Date.now());
    
    const [farmState, setFarmState] = useState<FarmState>(INITIAL_FARM_STATE);
    const [showFarmUnlock, setShowFarmUnlock] = useState(false);
    const farmUnlockCost = 10000;
    
    const [autoPilotState, setAutoPilotState] = useState<AutoPilotState>(INITIAL_AUTO_PILOT_STATE);
    const [activeAutoPilotExpedition, setActiveAutoPilotExpedition] = useState<AutoPilotExpedition | null>(null);
    const [autoPilotReport, setAutoPilotReport] = useState<AutoPilotState['sessionGains'] | null>(null);
    
    const autoPilotCycleIndex = useRef(0);

    const generateLogEntry = useCallback(async (context: string): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Você é a IA do diário de bordo de um comandante de frota espacial. Baseado no seguinte evento, escreva uma única frase concisa e dramática para o diário de bordo da nave. Evento: "${context}"`,
            });
            return response.text.trim();
        } catch (error) {
            console.error("Gemini text generation failed:", error);
            return `Log: Evento resolvido. (${context})`; // Fallback
        }
    }, []);

    const generateAutopilotNarrative = useCallback(async (shipName: string, locationName: string, eventContext: string): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Você é a IA de um sistema de piloto automático de uma nave estelar. Escreva uma entrada de log curta e imersiva (1-2 frases) para o capitão. A nave, chamada '${shipName}', acabou de concluir uma tarefa em '${locationName}'. O evento foi: '${eventContext}'. Seja criativo e varie o tom (por exemplo, rotineiro, empolgante, perigoso).`,
            });
            return `[${new Date().toLocaleTimeString()}] ${response.text.trim()}`;
        } catch (error) {
            console.error("Gemini autopilot narrative failed:", error);
            return `[${new Date().toLocaleTimeString()}] Autopilot retornou de ${locationName}. ${eventContext}`; // Fallback
        }
    }, []);


    const activeShip = useMemo(() => ships.find(s => s.id === activeShipId) || null, [ships, activeShipId]);

    const addResources = useCallback((newResources: { [key: string]: number }) => {
        setResources(prev => {
            const updated = { ...prev };
            for (const key in newResources) {
                updated[key] = (updated[key] || 0) + newResources[key];
                 if (updated[key] < 0) updated[key] = 0; // Prevent negative resources
            }
            return updated;
        });
    }, []);
    
    const addXp = useCallback((amount: number) => {
        setPlayerState(prev => {
            let newXp = prev.xp + amount;
            let newLevel = prev.level;
            let newXpToNextLevel = prev.xpToNextLevel;
            let newAttributePoints = prev.attributePoints;

            while (newXp >= newXpToNextLevel) {
                newXp -= newXpToNextLevel;
                newLevel++;
                newXpToNextLevel = Math.floor(newXpToNextLevel * XP_SCALING_FACTOR);
                newAttributePoints += 1; // 1 point per level
            }
            return { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newXpToNextLevel, attributePoints: newAttributePoints };
        });
    }, []);

    const generateMissions = useCallback((playerLevel: number): Mission[] => {
        const newMissions: Mission[] = [];
        const numToGenerate = Math.floor(Math.random() * 5) + 1; // 1 to 5 missions

        const rarityChances = {
            'Common': 0.5,
            'Uncommon': 0.3,
            'Rare': 0.15,
            'Epic': 0.04,
            'Legendary': 0.01,
        };

        const availableRarities = Object.keys(MISSION_TEMPLATES).filter(r => r !== 'Mythic') as Rarity[];

        for (let i = 0; i < numToGenerate; i++) {
            const rand = Math.random();
            let cumulative = 0;
            let selectedRarity: Rarity = 'Common';
            for (const r of availableRarities) {
                cumulative += rarityChances[r as keyof typeof rarityChances] || 0;
                if (rand < cumulative) {
                    selectedRarity = r;
                    break;
                }
            }

            const template = MISSION_TEMPLATES[selectedRarity];
            if (!template) continue;

            const objectiveResource = template.objective.resources[Math.floor(Math.random() * template.objective.resources.length)];
            const objectiveAmount = Math.floor(Math.random() * (template.objective.amountRange[1] - template.objective.amountRange[0] + 1)) + template.objective.amountRange[0];
            
            const rewardCredits = Math.floor(Math.random() * (template.rewards.creditsRange[1] - template.rewards.creditsRange[0] + 1)) + template.rewards.creditsRange[0];
            const rewardXp = Math.floor(Math.random() * (template.rewards.xpRange[1] - template.rewards.xpRange[0] + 1)) + template.rewards.xpRange[0];
            
            const rewards: MissionReward = { credits: rewardCredits, xp: rewardXp };

            if (template.rewards.resources) {
                const rewardResource = template.rewards.resources.pool[Math.floor(Math.random() * template.rewards.resources.pool.length)];
                const rewardAmount = Math.floor(Math.random() * (template.rewards.resources.amountRange[1] - template.rewards.resources.amountRange[0] + 1)) + template.rewards.resources.amountRange[0];
                rewards.resources = { [rewardResource]: rewardAmount };
            }
            if (template.rewards.shipBoxChance && Math.random() < template.rewards.shipBoxChance) {
                rewards.shipBoxes = 1;
            }

            const resourceDef = RESOURCE_DEFINITIONS[objectiveResource];
            const mission: Mission = {
                id: `mission_${Date.now()}_${i}`,
                rarity: selectedRarity,
                title: template.title[Math.floor(Math.random() * template.title.length)],
                description: `Uma facção local precisa de uma entrega de ${objectiveAmount} unidades de ${resourceDef?.name || objectiveResource}. Colete os recursos e entregue para receber sua recompensa.`,
                type: 'COLLECT',
                objective: {
                    resource: objectiveResource,
                    amount: objectiveAmount,
                    description: `Coletar ${objectiveAmount} ${resourceDef?.name || objectiveResource}`
                },
                rewards: rewards,
            };
            newMissions.push(mission);
        }
        return newMissions;
    }, []);
    
    useEffect(() => {
        if (gameState !== GameStateEnum.MainMenu) {
            const now = currentTime;
            if (missionState.availableMissions.length === 0 || (now - missionState.lastMissionRefresh > MISSION_REFRESH_INTERVAL_MS)) {
                const newMissions = generateMissions(playerState.level);
                setMissionState(prev => ({
                    ...prev,
                    availableMissions: newMissions,
                    lastMissionRefresh: now
                }));
            }
        }
    }, [currentTime, gameState, playerState.level, generateMissions, missionState.lastMissionRefresh, missionState.availableMissions.length]);


    // Game Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Expedition processing
    useEffect(() => {
        const now = currentTime;
        setActiveExpeditions(prevExpeditions => {
            return prevExpeditions.map(exp => {
                if (exp.isPaused || exp.isAuto) return exp;

                const duration = exp.endTime - exp.startTime;
                const elapsed = now - exp.startTime;
                const progress = elapsed / duration;
                
                let newLog = [...exp.log];
                let newIntegrity = exp.currentIntegrity;
                const newMilestones = new Set(exp.milestones);
                
                const checkMilestone = (percent: number) => {
                    if (progress >= percent && !exp.milestones.has(percent)) {
                        newMilestones.add(percent);
                        
                        // Environmental Hazard Check
                        if (Math.random() < exp.location.environmentalHazard) {
                            const damage = Math.floor(exp.location.difficulty * (Math.random() * 3 + 2));
                            newIntegrity = Math.max(0, newIntegrity - damage);
                            newLog.push(`ALERTA: Perigo ambiental detectado! A nave sofreu ${damage} de dano.`);
                        }

                        // Random Event Check
                        const eligibleEvents = RANDOM_EVENTS.filter(e => e.minDifficulty <= exp.location.difficulty);
                        if (eligibleEvents.length > 0 && Math.random() < 0.25) { // 25% chance at each milestone
                            const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
                            return { ...exp, isPaused: true, activeEvent: event, lastPauseStartTime: now, log: newLog, currentIntegrity: newIntegrity, milestones: newMilestones };
                        }
                    }
                    return null;
                };

                const milestoneChecks = [0.25, 0.5, 0.75];
                for (const ms of milestoneChecks) {
                    const eventState = checkMilestone(ms);
                    if (eventState) return eventState;
                }

                return { ...exp, log: newLog, currentIntegrity: newIntegrity, milestones: newMilestones };
            });
        });

        const completedDeepSpace = activeDeepSpaceExpeditions.find(exp => now >= exp.endTime);
        if (completedDeepSpace) {
            handleCompleteDeepSpaceExpedition(completedDeepSpace.id);
        }

    }, [currentTime]);

    const initializeNewGame = () => {
        setResources(INITIAL_RESOURCES);
        setPlayerState(INITIAL_PLAYER_STATE);
        setInventory([]);
        setCapsules([]);
        setShips([]);
        setActiveShipId(null);
        setDefendingShipId(null);
        setShipBoxes(1);
        setActiveExpeditions([]);
        setActiveDeepSpaceExpeditions([]);
        setExpeditionResult(null);
        setCapsuleResult(null);
        setShipResult(null);
        setCurrentTime(Date.now());
        setFarmState(INITIAL_FARM_STATE);
        setShowFarmUnlock(false);
        setMissionState(INITIAL_MISSION_STATE);
        setAutoPilotState(INITIAL_AUTO_PILOT_STATE);
        setAutoPilotReport(null);
        setGameState(GameStateEnum.Game);
    }
    
    const migrateSaveData = useCallback((savedData: any) => {
        const version = savedData.version || '1.0.0';
        let data = savedData.data || savedData; // Handle old saves without the version wrapper

        if (version < '1.4.0') {
            // Reset player XP to be fair with the new curve if they are not level 1
            if (data.playerState && data.playerState.level > 1) {
                let xpToNext = BASE_XP_TO_LEVEL_UP;
                for(let i=1; i < data.playerState.level; i++) {
                    xpToNext = Math.floor(xpToNext * XP_SCALING_FACTOR);
                }
                data.playerState.xpToNextLevel = xpToNext;
            }
             data.ships = data.ships.map((ship: any) => {
                if (!ship.baseStats) {
                    return {
                        ...ship,
                        baseStats: { ...ship.stats },
                        upgrades: {},
                    };
                }
                return ship;
            });
        }
        
        return data;
    }, []);

    // --- AUTOPILOT SIMULATION ---
    const simulateAutoExpedition = useCallback((ship: Ship, location: Location): { resourcesGained: Resources, xpGained: number, capsuleGained?: GachaCapsule, integrityLost: number, log: string[] } => {
        let resourcesGained: Resources = {};
        let capsuleGained: GachaCapsule | undefined = undefined;
        let integrityLost = 0;
        const log: string[] = [];

        // Base rewards
        for (const key in location.rewards) {
            const [min, max] = location.rewards[key];
            resourcesGained[key] = Math.floor((Math.random() * (max - min) + min) * ship.stats.miningEfficiency * ship.stats.luck);
        }
        if (Math.random() < location.capsuleDropChance * ship.stats.luck) {
            const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare'];
            const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
            capsuleGained = { id: `cap_${Date.now()}_${Math.random()}`, rarity: randomRarity };
        }
        
        // Hazard damage
        if (Math.random() < location.environmentalHazard) {
            const damage = Math.floor(location.difficulty * (Math.random() * 3 + 2));
            integrityLost += damage;
            log.push(`Perigo ambiental detectado. Dano sofrido: ${damage}.`);
        } else {
            log.push(`Navegação tranquila, sem perigos imediatos.`);
        }

        // Random Event
        const eligibleEvents = RANDOM_EVENTS.filter(e => e.minDifficulty <= location.difficulty);
        if (eligibleEvents.length > 0 && Math.random() < 0.25) { // 25% chance per trip
            const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
            
            const safestOption = event.options.reduce((best, current) => !current.cost ? current : best);
            let result: RandomEventResult;
            let success = false;

            if ('stat' in safestOption.result) {
                const check = safestOption.result as RandomEventSkillCheck;
                success = Math.random() < Math.min(0.95, ((ship.stats[check.stat] || 0) / check.difficulty) * 0.6);
                result = success ? check.success : check.failure;
            } else {
                result = safestOption.result as RandomEventResult;
                success = true;
            }
            
            log.push(`Evento encontrado: "${event.title}". Decisão: "${safestOption.text}". ${success ? 'Sucesso.' : 'Falha.'}`);
            
            if (result.resourcesGained) {
                 Object.entries(result.resourcesGained).forEach(([key, val]) => resourcesGained[key] = (resourcesGained[key] || 0) + val);
            }
            if(result.integrityLost) integrityLost += result.integrityLost;
        }

        return { resourcesGained, xpGained: location.xpReward, capsuleGained, integrityLost, log };
    }, []);

    const handleSaveGame = useCallback(() => {
        const saveData = {
            resources,
            playerState,
            inventory,
            capsules,
            ships,
            activeShipId,
            defendingShipId,
            shipBoxes,
            activeExpeditions: activeExpeditions.map(exp => ({
                ...exp,
                milestones: Array.from(exp.milestones), // Convert Set to Array for JSON
            })),
            activeDeepSpaceExpeditions,
            farmState,
            missionState,
            autoPilotState: {
                ...autoPilotState,
                lastUpdateTime: Date.now(), // Update time on save
            },
            saveTime: Date.now(),
        };
        const dataToStore = {
            version: SAVE_VERSION,
            data: saveData,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(dataToStore));
    }, [resources, playerState, inventory, capsules, ships, activeShipId, defendingShipId, shipBoxes, activeExpeditions, activeDeepSpaceExpeditions, farmState, missionState, autoPilotState]);

    const handleLoadGame = useCallback(() => {
        const savedDataString = localStorage.getItem(SAVE_KEY);
        if (savedDataString) {
            const rawSavedData = JSON.parse(savedDataString);
            const savedData = migrateSaveData(rawSavedData);
            
            let finalResources = { ...savedData.resources };
            let finalPlayerState = { ...savedData.playerState };
            let finalShips = [...savedData.ships];
            let finalCapsules = [...savedData.capsules];
            let finalAutoPilotState = savedData.autoPilotState || INITIAL_AUTO_PILOT_STATE;
            
            // --- OFFLINE AUTOPILOT CALCULATION ---
            if (finalAutoPilotState.active && finalAutoPilotState.shipId && finalAutoPilotState.locationIds.length > 0) {
                const timeOfflineMs = Date.now() - finalAutoPilotState.lastUpdateTime;
                const autopilotDurationMs = Math.min(timeOfflineMs, finalAutoPilotState.remainingTimeMs);

                const offlineGains: AutoPilotState['sessionGains'] = { resources: {}, xp: 0, capsules: [] };
                const offlineLog: string[] = [`[${new Date().toLocaleTimeString()}] Retornando ao sistema. Calculando progresso AFK...`];
                
                let elapsedTimeMs = 0;
                let cycleIndex = 0;
                let tempShip = finalShips.find(s => s.id === finalAutoPilotState.shipId);

                while (elapsedTimeMs < autopilotDurationMs && tempShip) {
                    const locationId = finalAutoPilotState.locationIds[cycleIndex % finalAutoPilotState.locationIds.length];
                    const location = LOCATIONS.find(l => l.id === locationId);
                    if (!location) break;

                    const durationSeconds = 60 + (location.difficulty * 30) / tempShip.stats.speed;
                    const durationMs = durationSeconds * 1000;

                    if (elapsedTimeMs + durationMs > autopilotDurationMs) break;
                    
                    elapsedTimeMs += durationMs;

                    // Simulate expedition result
                    const result = simulateAutoExpedition(tempShip, location);
                    
                    Object.entries(result.resourcesGained).forEach(([key, val]) => offlineGains.resources[key] = (offlineGains.resources[key] || 0) + val);
                    offlineGains.xp += result.xpGained;
                    if (result.capsuleGained) offlineGains.capsules.push(result.capsuleGained);
                    offlineLog.push(...result.log.map(l => `[AFK] ${l}`));
                    
                    tempShip.stats.integrity -= result.integrityLost;
                    
                    cycleIndex++;
                }

                if (elapsedTimeMs > 0) {
                     // Apply gains
                    Object.entries(offlineGains.resources).forEach(([key, val]) => finalResources[key] = (finalResources[key] || 0) + val);
                    let newXp = finalPlayerState.xp + offlineGains.xp;
                     while (newXp >= finalPlayerState.xpToNextLevel) {
                        newXp -= finalPlayerState.xpToNextLevel;
                        finalPlayerState.level++;
                        finalPlayerState.xpToNextLevel = Math.floor(finalPlayerState.xpToNextLevel * XP_SCALING_FACTOR);
                    }
                    finalPlayerState.xp = newXp;
                    finalCapsules.push(...offlineGains.capsules);

                    setAutoPilotReport(offlineGains); // Show report on load
                }

                finalAutoPilotState = {
                    ...finalAutoPilotState,
                    active: false,
                    remainingTimeMs: Math.max(0, finalAutoPilotState.remainingTimeMs - elapsedTimeMs),
                };
            }


            setResources(finalResources);
            setPlayerState(finalPlayerState);
            setInventory(savedData.inventory);
            setCapsules(finalCapsules);
            setShips(finalShips);
            setActiveShipId(savedData.activeShipId);
            setDefendingShipId(savedData.defendingShipId);
            setShipBoxes(savedData.shipBoxes);
            
            const loadedExpeditions = savedData.activeExpeditions.map((exp: any) => ({
                ...exp,
                milestones: new Set(exp.milestones),
            }));
            setActiveExpeditions(loadedExpeditions);
            
            const loadedDeepSpaceExpeditions = savedData.activeDeepSpaceExpeditions || [];
            setActiveDeepSpaceExpeditions(loadedDeepSpaceExpeditions);

            setFarmState(savedData.farmState);
            setAutoPilotState(finalAutoPilotState);

            let loadedMissions = savedData.missionState || INITIAL_MISSION_STATE;
            const now = Date.now();
            if (!loadedMissions.availableMissions || loadedMissions.availableMissions.length === 0 || (now - loadedMissions.lastMissionRefresh > MISSION_REFRESH_INTERVAL_MS)) {
                const newMissions = generateMissions(savedData.playerState.level);
                loadedMissions = {
                    ...loadedMissions,
                    availableMissions: newMissions,
                    lastMissionRefresh: now,
                };
            }
            setMissionState(loadedMissions);
            
            setGameState(GameStateEnum.Game);
        } else {
            initializeNewGame();
        }
    }, [generateMissions, migrateSaveData, simulateAutoExpedition]);

    const handleSaveAndExit = useCallback(() => {
        handleSaveGame();
        setGameState(GameStateEnum.MainMenu);
    }, [handleSaveGame]);

    const handleExplore = (location: Location, shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (!ship) return;

        const fuelNeeded = location.fuelCost;
        if ((resources[FUEL] || 0) < fuelNeeded) {
            alert('Combustível insuficiente!');
            return;
        }

        const durationInSeconds = 60 + (location.difficulty * 30) / ship.stats.speed;
        const now = Date.now();
        const newExpedition: Expedition = {
            id: `exp_${now}`,
            shipId: ship.id,
            location,
            startTime: now,
            endTime: now + durationInSeconds * 1000,
            startingIntegrity: ship.stats.integrity,
            currentIntegrity: ship.stats.integrity,
            log: [`Expedição para ${location.name} iniciada.`],
            milestones: new Set(),
            activeEvent: null,
            isPaused: false
        };

        setResources(prev => ({ ...prev, [FUEL]: prev[FUEL] - fuelNeeded }));
        setActiveExpeditions(prev => [...prev, newExpedition]);
    };

    const handleCompleteExpedition = (expeditionId: string) => {
        const expedition = activeExpeditions.find(exp => exp.id === expeditionId);
        if (!expedition) return;

        const ship = ships.find(s => s.id === expedition.shipId);
        if (!ship) return;
        
        const shipPower = ship.stats.attack + ship.stats.defense;
        const locationPower = expedition.location.requiredAttack + expedition.location.requiredDefense;
        let successChance = Math.min(1, shipPower / locationPower) * ship.stats.luck;
        const success = Math.random() < successChance;
        const criticalSuccess = success && Math.random() < (0.1 * ship.stats.luck);
        
        let resourcesGained: Resources = {};
        let itemsGained: Item[] = [];
        let capsuleGained: GachaCapsule | undefined = undefined;
        let combatOutcome: ExpeditionResult['combatOutcome'] = null;
        let combatLog = "Nenhum combate encontrado.";

        if (success) {
            const luckFactor = criticalSuccess ? 1.5 * ship.stats.luck : ship.stats.luck;
            for (const key in expedition.location.rewards) {
                const [min, max] = expedition.location.rewards[key];
                resourcesGained[key] = Math.floor((Math.random() * (max - min) + min) * ship.stats.miningEfficiency * luckFactor);
            }
            if (expedition.location.itemDrop && Math.random() < expedition.location.itemDrop.chance * ship.stats.luck) {
                const item = ITEMS[expedition.location.itemDrop.id];
                if (item) itemsGained.push(item);
            }
             if (Math.random() < expedition.location.capsuleDropChance * ship.stats.luck) {
                const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
                const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
                capsuleGained = { id: `cap_${Date.now()}`, rarity: randomRarity };
            }

            if (Math.random() < expedition.location.enemyEncounterChance) {
                const enemyKey = Object.keys(ENEMIES)[0]; // Simplified for now
                const enemy = ENEMIES[enemyKey];
                combatLog = `Encontrou um ${enemy.name}! `;
                
                const playerCombatPower = ship.stats.attack * 1.5 + ship.stats.defense;
                const enemyCombatPower = enemy.attack * 1.5 + enemy.defense;
                const victory = Math.random() < (playerCombatPower / (playerCombatPower + enemyCombatPower));

                if (victory) {
                    combatLog += "A nave saiu vitoriosa!";
                    let specialLoot: Resources = {};
                    Object.entries(enemy.rewards).forEach(([res, [min, max]]) => {
                        specialLoot[res] = (specialLoot[res] || 0) + Math.floor(Math.random() * (max - min + 1) + min);
                    });
                     combatOutcome = { victory: true, enemyName: enemy.name, log: combatLog, specialLoot };
                } else {
                    combatLog += "A nave foi derrotada e perdeu parte da carga.";
                    const resourcesLost: Resources = {};
                    Object.keys(resourcesGained).forEach(key => {
                        const amountToLose = Math.floor(resourcesGained[key] * 0.5);
                        if (amountToLose > 0) {
                            resourcesLost[key] = amountToLose;
                            resourcesGained[key] -= amountToLose;
                        }
                    });
                    combatOutcome = { victory: false, enemyName: enemy.name, log: combatLog, resourcesLost };
                }
            }

        } else {
            combatLog = "A expedição não encontrou recursos significativos.";
        }

        const integrityLost = ship.stats.integrity - expedition.currentIntegrity;
        const finalXpGained = success ? expedition.location.xpReward : Math.floor(expedition.location.xpReward / 4);

        setExpeditionResult({
            locationName: expedition.location.name,
            resourcesGained,
            itemsGained,
            capsuleGained,
            xpGained: finalXpGained,
            integrityLost,
            combatOutcome,
            success,
            criticalSuccess,
            combatLog,
        });
        
        setActiveExpeditions(prev => prev.filter(exp => exp.id !== expeditionId));
        setShips(prevShips => prevShips.map(s => s.id === expedition.shipId ? { ...s, stats: { ...s.stats, integrity: expedition.currentIntegrity } } : s));
    };
    
     const handleClaimRewards = () => {
        if (!expeditionResult) return;

        addResources(expeditionResult.resourcesGained);
        if (expeditionResult.combatOutcome?.specialLoot) {
            addResources(expeditionResult.combatOutcome.specialLoot);
        }
        if(expeditionResult.itemsGained) {
            setInventory(prev => [...prev, ...expeditionResult!.itemsGained!]);
        }
        if (expeditionResult.capsuleGained) {
            setCapsules(prev => [...prev, expeditionResult!.capsuleGained!]);
        }
        addXp(expeditionResult.xpGained);
        
        setExpeditionResult(null);
    };

    const handleResolveEvent = async (option: RandomEventOption) => {
        const expIndex = activeExpeditions.findIndex(e => e.activeEvent);
        if (expIndex === -1) return;
        
        const exp = activeExpeditions[expIndex];
        const ship = ships.find(s => s.id === exp.shipId)!;

        if (option.cost) {
            addResources(Object.fromEntries(Object.entries(option.cost).map(([k, v]) => [k, -v])));
        }

        let result: RandomEventResult;
        let success = false;
        if ('stat' in option.result) { // Skill Check
            const check = option.result as RandomEventSkillCheck;
            const statValue = ship.stats[check.stat] || 0;
            const difficulty = check.difficulty > 0 ? check.difficulty : 1;
            const successChance = Math.max(0.1, Math.min(0.95, (statValue / difficulty) * 0.5));
            success = Math.random() < successChance;
            result = success ? check.success : check.failure;
        } else {
            result = option.result as RandomEventResult;
            success = true; // Non-skill checks are considered successful for logging
        }

        const context = `A nave ${ship.name} encontrou "${exp.activeEvent?.title}". Ação: "${option.text}". Resultado: ${success ? 'Sucesso' : 'Falha'}.`;
        const narrativeLog = await generateLogEntry(context);
        const newLog = [...exp.log, narrativeLog];
        let newIntegrity = exp.currentIntegrity;
        
        if (result.resourcesGained) addResources(result.resourcesGained);
        if (result.itemsGained) setInventory(prev => [...prev, ...result.itemsGained!]);
        if (result.capsuleGained) setCapsules(prev => [...prev, result.capsuleGained]);
        if (result.xpGained) addXp(result.xpGained);
        if (result.integrityLost) newIntegrity = Math.max(0, newIntegrity - result.integrityLost);

        const now = Date.now();
        const timePaused = now - exp.lastPauseStartTime!;
        
        setActiveExpeditions(prev => prev.map((e, i) => i === expIndex ? {
            ...e,
            isPaused: false,
            activeEvent: null,
            log: newLog,
            currentIntegrity: newIntegrity,
            endTime: e.endTime + timePaused
        } : e));

        setShips(prevShips => prevShips.map(s => s.id === exp.shipId ? { ...s, stats: { ...s.stats, integrity: newIntegrity } } : s));
    };

    const handleStartDeepSpaceExpedition = (location: DeepSpaceLocation, shipId: string, durationHours: number) => {
        const ship = ships.find(s => s.id === shipId);
        if (!ship) return;
    
        const now = Date.now();
        const newExpedition: DeepSpaceExpedition = {
            id: `ds_exp_${now}`,
            shipId: ship.id,
            location,
            startTime: now,
            endTime: now + durationHours * 60 * 60 * 1000,
        };
    
        setActiveDeepSpaceExpeditions(prev => [...prev, newExpedition]);
    };

    const handleCompleteDeepSpaceExpedition = (expeditionId: string) => {
        const expedition = activeDeepSpaceExpeditions.find(exp => exp.id === expeditionId);
        if (!expedition) return;
    
        const ship = ships.find(s => s.id === expedition.shipId);
        if (!ship) return;
    
        const durationHours = (expedition.endTime - expedition.startTime) / (1000 * 60 * 60);
        const powerRatio = calculateCombatPower(ship.stats) / (expedition.location.difficulty * 50);
        const successChance = Math.min(0.98, 0.5 + powerRatio * 0.25);
        const success = Math.random() < successChance;
        const criticalSuccess = success && Math.random() < (0.1 * ship.stats.luck);
    
        let finalResources: Resources = {};
        let finalItems: Item[] = [];
        let finalCapsule: GachaCapsule | undefined;
        let integrityLost = 0;
        let finalXp = 0;
        const deepSpaceEventLog: string[] = [];
    
        if (success) {
            const luckFactor = criticalSuccess ? 1.5 * ship.stats.luck : ship.stats.luck;
            finalXp = Math.floor(expedition.location.baseXpReward * durationHours * luckFactor);
    
            for (const resKey in expedition.location.rewards) {
                const [min, max] = expedition.location.rewards[resKey];
                const amountPerHour = Math.random() * (max - min) + min;
                finalResources[resKey] = Math.floor(amountPerHour * durationHours * luckFactor * ship.stats.miningEfficiency);
            }
    
            const eventChecks = Math.floor(durationHours);
            for (let i = 0; i < eventChecks; i++) {
                if (Math.random() < expedition.location.eventChance) {
                    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
                    deepSpaceEventLog.push(`> Evento detectado: ${event.title}`);
                    
                    const bestOption = event.options.reduce((best, current) => {
                        let currentScore = 0;
                        if ('stat' in current.result) {
                            const check = current.result as RandomEventSkillCheck;
                            currentScore = (ship.stats[check.stat] || 0) / check.difficulty;
                        }
                        if (current.cost) currentScore -= 10;
                        
                        let bestScore = 0;
                         if ('stat' in best.result) {
                            const check = best.result as RandomEventSkillCheck;
                            bestScore = (ship.stats[check.stat] || 0) / check.difficulty;
                        }
                        if (best.cost) bestScore -= 10;
                        
                        return currentScore > bestScore ? current : best;
                    });
    
                    deepSpaceEventLog.push(`> Decisão da IA: "${bestOption.text}"`);
                    
                    let result: RandomEventResult;
                     if ('stat' in bestOption.result) {
                        const check = bestOption.result as RandomEventSkillCheck;
                        const success = Math.random() < Math.min(0.95, ((ship.stats[check.stat] || 0) / check.difficulty) * 0.6);
                        result = success ? check.success : check.failure;
                    } else {
                        result = bestOption.result as RandomEventResult;
                    }
    
                    deepSpaceEventLog.push(`> Resultado: ${result.log}`);
                    if(result.resourcesGained) {
                         Object.entries(result.resourcesGained).forEach(([key, val]) => finalResources[key] = (finalResources[key] || 0) + val);
                    }
                    if(result.integrityLost) integrityLost += result.integrityLost;
                    if(result.xpGained) finalXp += result.xpGained;
                }
            }
        }
    
        setExpeditionResult({
            locationName: expedition.location.name,
            resourcesGained: finalResources,
            itemsGained: finalItems,
            capsuleGained: finalCapsule,
            xpGained: finalXp,
            integrityLost,
            combatOutcome: null,
            success,
            criticalSuccess,
            combatLog: "",
            isDeepSpace: true,
            deepSpaceEventLog,
        });
    
        setActiveDeepSpaceExpeditions(prev => prev.filter(e => e.id !== expeditionId));
        setShips(prevShips => prevShips.map(s => s.id === expedition.shipId ? { ...s, stats: { ...s.stats, integrity: Math.max(0, s.stats.integrity - integrityLost) } } : s));
    };

    const handleSellResource = (resource: string, amount: number) => {
        if ((resources[resource] || 0) >= amount) {
            const value = (RESOURCE_DEFINITIONS[resource]?.baseSellPrice || 0) * amount;
            addResources({ [resource]: -amount, [CREDITS]: value });
        }
    };

    const handleCraftUpgrade = useCallback((upgradeId: string) => {
        if (!activeShip) return;

        const upgrade = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId)!;
        const currentLevel = activeShip.upgrades[upgrade.id] || 0;
        
        const costMultiplier = Math.pow(1.2, currentLevel);
        const currentCost = Object.fromEntries(
            Object.entries(upgrade.cost).map(([res, amount]) => [res, Math.floor(amount * costMultiplier)])
        );

        const canAfford = Object.entries(currentCost).every(([res, amount]) => (resources[res] || 0) >= amount);
        if (!canAfford) return;

        const costToDeduct = Object.fromEntries(Object.entries(currentCost).map(([k, v]) => [k, -v]));
        addResources(costToDeduct);
        
        const newUpgrades = { ...activeShip.upgrades, [upgradeId]: currentLevel + 1 };
        
        // Recalculate stats based on base stats and new upgrades
        const newStats = { ...activeShip.baseStats };
        for (const upId in newUpgrades) {
            const level = newUpgrades[upId];
            const def = UPGRADE_DEFINITIONS.find(u => u.id === upId);
            if (def) {
                const totalBonusPercent = def.value * level;
                const baseValue = activeShip.baseStats[def.stat];
                (newStats as any)[def.stat] = baseValue + (baseValue * totalBonusPercent);
            }
        }

        // Handle integrity increase
        if (upgrade.stat === 'maxIntegrity') {
            const integrityBonus = activeShip.baseStats.maxIntegrity * upgrade.value;
            newStats.integrity = Math.min(newStats.maxIntegrity, activeShip.stats.integrity + integrityBonus);
        } else {
            const integrityPercent = activeShip.stats.integrity / activeShip.stats.maxIntegrity;
            newStats.integrity = newStats.maxIntegrity * integrityPercent;
        }

        // Round values to avoid floating point issues
        Object.keys(newStats).forEach(key => {
             const statKey = key as ShipStat;
             if (statKey !== 'critChance' && statKey !== 'critDamage' && statKey !== 'luck' && statKey !== 'miningEfficiency' && statKey !== 'speed') {
                (newStats as any)[statKey] = Math.floor(newStats[statKey] as number);
             } else {
                (newStats as any)[statKey] = parseFloat((newStats[statKey] as number).toFixed(4));
             }
        });

        const newCombatPower = calculateCombatPower(newStats);

        setShips(ships.map(s => s.id === activeShipId ? { ...s, upgrades: newUpgrades, stats: newStats, combatPower: newCombatPower } : s));
    }, [activeShip, resources, ships, addResources, activeShipId]);


    const handleDistributePoint = (stat: ShipStat) => {
        if (!activeShip || playerState.attributePoints <= 0) return;

        const newBaseStats = { ...activeShip.baseStats };
        const increment = stat === 'attack' || stat === 'defense' ? 1 :
                          stat === 'maxIntegrity' ? 5 :
                          stat === 'speed' ? 0.1 :
                          stat === 'cargo' ? 10 :
                          stat === 'critChance' ? 0.01 : 0.05; // critDamage
        
        (newBaseStats as any)[stat] = parseFloat(((newBaseStats[stat] || 0) + increment).toFixed(4));
        if (stat === 'maxIntegrity') newBaseStats.integrity += 5;

        // After updating base stats, we need to recalculate the derived stats
        const newStats = { ...newBaseStats };
        for (const upId in activeShip.upgrades) {
            const level = activeShip.upgrades[upId];
            const def = UPGRADE_DEFINITIONS.find(u => u.id === upId);
            if (def) {
                const totalBonusPercent = def.value * level;
                const baseValue = newBaseStats[def.stat];
                (newStats as any)[def.stat] = baseValue + (baseValue * totalBonusPercent);
            }
        }
        
         Object.keys(newStats).forEach(key => {
             const statKey = key as ShipStat;
             if (statKey !== 'critChance' && statKey !== 'critDamage' && statKey !== 'luck' && statKey !== 'miningEfficiency' && statKey !== 'speed') {
                (newStats as any)[statKey] = Math.floor(newStats[statKey] as number);
             } else {
                (newStats as any)[statKey] = parseFloat((newStats[statKey] as number).toFixed(4));
             }
        });

        const newCombatPower = calculateCombatPower(newStats);
        setShips(ships.map(s => s.id === activeShipId ? { ...s, baseStats: newBaseStats, stats: newStats, combatPower: newCombatPower } : s));
        setPlayerState(p => ({ ...p, attributePoints: p.attributePoints - 1 }));
    };

    const handleSellItem = (itemIndex: number) => {
        const item = inventory[itemIndex];
        const value = RARITY_SELL_VALUES[item.rarity];
        addResources({ [CREDITS]: value });
        setInventory(prev => prev.filter((_, index) => index !== itemIndex));
    };
    
    const handleOpenCapsule = (capsuleIndex: number) => {
        const capsule = capsules[capsuleIndex];
        const content = CAPSULE_CONTENTS_BY_RARITY[capsule.rarity];
        let results: { [key: string]: number } = {};

        for (let i = 0; i < content.pulls; i++) {
            const possibleResources = Object.keys(content.resourcePool);
            const resourceKey = possibleResources[Math.floor(Math.random() * possibleResources.length)];
            const [min, max] = content.resourcePool[resourceKey];
            const amount = Math.floor(Math.random() * (max - min + 1) + min);
            results[resourceKey] = (results[resourceKey] || 0) + amount;
        }

        addResources(results);
        setCapsules(prev => prev.filter((_, index) => index !== capsuleIndex));
        setCapsuleResult({ results, rarity: capsule.rarity });
    };

    const handleOpenShipBox = () => {
        if (shipBoxes <= 0) return;
        setShipBoxes(prev => prev - 1);
        
        const rand = Math.random();
        let cumulative = 0;
        let determinedRarity: Rarity = 'Common';

        for (const rarity of (Object.keys(SHIP_RARITY_CHANCES) as Rarity[])) {
            cumulative += SHIP_RARITY_CHANCES[rarity];
            if (rand < cumulative) {
                determinedRarity = rarity;
                break;
            }
        }
        
        const newStats = SHIP_STATS_BY_RARITY[determinedRarity]();
        newStats.integrity = newStats.maxIntegrity;
        const combatPower = calculateCombatPower(newStats);

        const newShip: Ship = {
            id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: generateShipName(determinedRarity),
            rarity: determinedRarity,
            baseStats: { ...newStats },
            stats: newStats,
            upgrades: {},
            combatPower,
        };
        
        setShips(prev => [...prev, newShip]);
        if (!activeShipId) {
            setActiveShipId(newShip.id);
        }
        setShipResult(newShip);
    };

    const handleBuyConsumable = (itemId: string, cost: number) => {
        if (resources[CREDITS] >= cost) {
            addResources({ [CREDITS]: -cost });
            setResources(prev => ({...prev, [itemId]: (prev[itemId] || 0) + 1}));
        }
    };
    
    const handleUseConsumable = useCallback((itemId: string) => {
        const def = RESOURCE_DEFINITIONS[itemId];
        if (!def || (resources[itemId] || 0) < 1) return;

        if (itemId === FUEL_CAPSULE) {
            addResources({ [FUEL_CAPSULE]: -1, [FUEL]: def.value || 50 });
        } else if (itemId === REPAIR_CAPSULE) {
            if (activeShip) {
                addResources({ [REPAIR_CAPSULE]: -1 });
                setShips(prev => prev.map(ship => {
                    if (ship.id === activeShipId) {
                        const newIntegrity = Math.min(ship.stats.maxIntegrity, ship.stats.integrity + (def.value || 50));
                        return { ...ship, stats: { ...ship.stats, integrity: newIntegrity } };
                    }
                    return ship;
                }));
            }
        }
    }, [resources, activeShip, activeShipId, addResources]);
    
    const handleBuyAutopilotModule = () => {
        const cost = 250;
        if(resources[CREDITS] >= cost) {
            addResources({ [CREDITS]: -cost});
            setAutoPilotState(prev => ({...prev, remainingTimeMs: prev.remainingTimeMs + (3600 * 1000)}));
        }
    };

    const handleBuyShipBox = () => {
        const cost = Math.floor(SHIP_BOX_BASE_COST * (1 + (playerState.level - 1) * SHIP_BOX_LEVEL_SCALE));
        if (resources[CREDITS] >= cost) {
            addResources({ [CREDITS]: -cost });
            setShipBoxes(prev => prev + 1);
        }
    };
    
    const handleBuyShield = () => {
        const cost = Math.floor(SHIELD_BASE_COST * (1 + (playerState.level - 1) * SHIELD_LEVEL_SCALE));
        if (resources[CREDITS] >= cost && playerState.shields < MAX_SHIELDS) {
            addResources({ [CREDITS]: -cost });
            setPlayerState(p => ({ ...p, shields: p.shields + 1 }));
        }
    };

     // Farm Handlers
    const handlePlant = (x: number, y: number, plantId: string) => {
        const plantDef = PLANTS[plantId];
        if (!plantDef) return;

        const canAfford = Object.entries(plantDef.cost).every(([res, amount]) => (resources[res] || 0) >= amount);
        if (!canAfford) return;

        const cost = Object.fromEntries(Object.entries(plantDef.cost).map(([k, v]) => [k, -v]));
        addResources(cost);

        const now = Date.now();
        const newPlot: FarmPlot = {
            plantId,
            growthStartTime: now,
            growthEndTime: now + plantDef.growthTimeSeconds * 1000,
        };

        setFarmState(prev => {
            const newPlots = prev.plots.map(row => [...row]);
            newPlots[y][x] = newPlot;
            return { ...prev, plots: newPlots };
        });
    };

    const handleHarvest = (x: number, y: number) => {
        const plot = farmState.plots[y][x];
        const plantDef = plot.plantId ? PLANTS[plot.plantId] : null;
        if (!plantDef || !plot.growthEndTime || currentTime < plot.growthEndTime) return;

        addResources(plantDef.yield);
        
        const newPlot: FarmPlot = { plantId: null, growthStartTime: null, growthEndTime: null };
        setFarmState(prev => {
            const newPlots = prev.plots.map(row => [...row]);
            newPlots[y][x] = newPlot;
            return { ...prev, plots: newPlots };
        });
    };
    
    const handleUnlockFarm = () => {
        if ((resources[CREDITS] || 0) >= farmUnlockCost) {
            addResources({ [CREDITS]: -farmUnlockCost });
            setFarmState(prev => ({ ...prev, unlocked: true }));
            setShowFarmUnlock(false);
            setGameState(GameStateEnum.Farm);
        }
    };

    const handleSetActiveShip = (shipId: string) => {
        setActiveShipId(shipId);
    };

    const handleSetDefendingShip = (shipId: string | null) => {
        setDefendingShipId(shipId);
    };
    
    // Mission Handlers
    const handleAcceptMission = useCallback((missionId: string) => {
        if (missionState.acceptedMissions.length >= MAX_ACCEPTED_MISSIONS) return;
        const missionToAccept = missionState.availableMissions.find(m => m.id === missionId);
        if (missionToAccept) {
            setMissionState(prev => ({
                ...prev,
                availableMissions: prev.availableMissions.filter(m => m.id !== missionId),
                acceptedMissions: [...prev.acceptedMissions, missionToAccept]
            }));
        }
    }, [missionState]);

    const handleAbandonMission = useCallback((missionId: string) => {
        const missionToAbandon = missionState.acceptedMissions.find(m => m.id === missionId);
        if (missionToAbandon) {
            setMissionState(prev => ({
                ...prev,
                acceptedMissions: prev.acceptedMissions.filter(m => m.id !== missionId),
                availableMissions: [...prev.availableMissions, missionToAbandon]
            }));
        }
    }, [missionState]);

    const handleClaimMissionReward = useCallback((missionId: string) => {
        const mission = missionState.acceptedMissions.find(m => m.id === missionId);
        if (!mission) return;

        const objective = mission.objective;
        if ((resources[objective.resource] || 0) < objective.amount) {
            alert("Recursos insuficientes para completar a missão. Talvez você os tenha gastado?");
            return;
        }
        
        addResources({ [objective.resource]: -objective.amount });

        if (mission.rewards.credits) addResources({ [CREDITS]: mission.rewards.credits });
        if (mission.rewards.xp) addXp(mission.rewards.xp);
        if (mission.rewards.resources) addResources(mission.rewards.resources);
        if (mission.rewards.shipBoxes) setShipBoxes(prev => prev + (mission.rewards.shipBoxes || 0));

        setMissionState(prev => ({
            ...prev,
            acceptedMissions: prev.acceptedMissions.filter(m => m.id !== missionId)
        }));
    }, [missionState, resources, addResources, addXp]);
    
    // --- AUTOPILOT HANDLERS ---
    const handleStartAutopilot = useCallback((shipId: string, locationIds: number[]) => {
        const ship = ships.find(s => s.id === shipId);
        if (!ship) return;
        setAutoPilotState(prev => ({
            ...prev,
            active: true,
            shipId,
            locationIds,
            lastUpdateTime: Date.now(),
            log: [`[${new Date().toLocaleTimeString()}] Autopilot ativado para a nave ${ship.name}.`],
            sessionGains: { resources: {}, xp: 0, capsules: [] },
        }));
        autoPilotCycleIndex.current = 0;
    }, [ships]);
    
    const handleStopAutopilot = useCallback(() => {
        setAutoPilotState(prev => {
            if (!prev.active) return prev;
            
            const timeElapsed = Date.now() - prev.lastUpdateTime;
            const remainingTimeMs = prev.remainingTimeMs - timeElapsed;
        
            addResources(prev.sessionGains.resources);
            addXp(prev.sessionGains.xp);
            setCapsules(caps => [...caps, ...prev.sessionGains.capsules]);
            
            setAutoPilotReport(prev.sessionGains);
        
            return {
                ...INITIAL_AUTO_PILOT_STATE,
                remainingTimeMs: Math.max(0, remainingTimeMs),
            };
        });
        
        setActiveExpeditions(prev => prev.filter(e => !e.isAuto));
    }, [addResources, addXp]);
    
    // --- AUTOPILOT REAL-TIME LOGIC ---
    const autoPilotTick = async () => {
        if (!autoPilotState.active) return;
    
        const now = Date.now();
        const timeSinceLastUpdate = now - autoPilotState.lastUpdateTime;
        const newRemainingTime = autoPilotState.remainingTimeMs - timeSinceLastUpdate;
    
        if (newRemainingTime <= 0) {
            handleStopAutopilot();
            return;
        }
    
        setAutoPilotState(prev => ({ ...prev, remainingTimeMs: newRemainingTime, lastUpdateTime: now }));
    
        const autoShip = ships.find(s => s.id === autoPilotState.shipId);
        if (!autoShip) {
            handleStopAutopilot();
            return;
        }
    
        const currentAutoExp = activeExpeditions.find(e => e.isAuto);
    
        if (!currentAutoExp) {
            const locationId = autoPilotState.locationIds[autoPilotCycleIndex.current % autoPilotState.locationIds.length];
            const location = LOCATIONS.find(l => l.id === locationId);
            if (!location) { handleStopAutopilot(); return; }
    
            let tempShip = { ...autoShip };
            let tempResources = { ...resources };
            let logEntries: string[] = [];
            let stateUpdated = false;
    
            if (tempShip.stats.integrity < tempShip.stats.maxIntegrity * 0.7 && (tempResources[REPAIR_CAPSULE] || 0) > 0) {
                logEntries.push(`[${new Date().toLocaleTimeString()}] Cápsula de reparo consumida.`);
                handleUseConsumable(REPAIR_CAPSULE);
                stateUpdated = true;
            }
    
            if ((tempResources[FUEL] || 0) < location.fuelCost && (tempResources[FUEL_CAPSULE] || 0) > 0) {
                logEntries.push(`[${new Date().toLocaleTimeString()}] Cápsula de combustível consumida.`);
                handleUseConsumable(FUEL_CAPSULE);
                stateUpdated = true;
            }
    
            if (logEntries.length > 0) {
                 setAutoPilotState(prev => ({ ...prev, log: [...prev.log, ...logEntries] }));
            }
            if(stateUpdated) return; // Wait for next tick to have updated state for fuel check

            if ((resources[FUEL] || 0) < location.fuelCost) {
                setAutoPilotState(prev => ({ ...prev, log: [...prev.log, `[${new Date().toLocaleTimeString()}] Combustível insuficiente. Autopilot desativado.`] }));
                handleStopAutopilot();
                return;
            }
    
            const durationInSeconds = 60 + (location.difficulty * 30) / autoShip.stats.speed; // Match manual expedition time
            const newExpedition: Expedition = {
                id: `exp_auto_${now}`, shipId: autoShip.id, location, startTime: now, endTime: now + durationInSeconds * 1000,
                startingIntegrity: autoShip.stats.integrity, currentIntegrity: autoShip.stats.integrity,
                log: [], milestones: new Set(), activeEvent: null, isPaused: false, isAuto: true,
            };
    
            setResources(prev => ({ ...prev, [FUEL]: prev[FUEL] - location.fuelCost }));
            setActiveExpeditions(prev => [...prev, newExpedition]);
            setAutoPilotState(prev => ({ ...prev, log: [...prev.log, `[${new Date().toLocaleTimeString()}] A nave ${autoShip.name} partiu para ${location.name}.`] }));
    
        } else if (now >= currentAutoExp.endTime) {
            const result = simulateAutoExpedition(autoShip, currentAutoExp.location);
    
            let logMessage: string;
            const narrativeChance = 0.4; // 40% chance for a narrative log

            if (Math.random() < narrativeChance) {
                 const gainedResources = Object.entries(result.resourcesGained).filter(([, val]) => val > 0);
                 let context = `Retornou com sucesso.`;
                 if(gainedResources.length > 0) {
                     context += ` Recursos obtidos: ${gainedResources.map(([key, val]) => `${val} ${RESOURCE_DEFINITIONS[key]?.name}`).join(', ')}.`;
                 }
                 if(result.integrityLost > 0) {
                    context += ` A nave sofreu ${result.integrityLost} de dano.`
                 }
                 if(result.capsuleGained) {
                    context += ` Uma cápsula ${result.capsuleGained.rarity} foi encontrada.`
                 }
                 logMessage = await generateAutopilotNarrative(autoShip.name, currentAutoExp.location.name, context);
            } else {
                logMessage = `[${new Date().toLocaleTimeString()}] Retornou de ${currentAutoExp.location.name}.`;
                 const gainedResources = Object.entries(result.resourcesGained).filter(([, val]) => val > 0);
                if (gainedResources.length > 0) {
                    logMessage += ` Recursos: ${gainedResources.map(([key, val]) => `${val} ${RESOURCE_DEFINITIONS[key]?.name}`).join(', ')}.`;
                }
            }
    
            setAutoPilotState(prev => {
                const newSessionGains = { ...prev.sessionGains };
                Object.entries(result.resourcesGained).forEach(([key, val]) => {
                    newSessionGains.resources[key] = (newSessionGains.resources[key] || 0) + val;
                });
                newSessionGains.xp += result.xpGained;
                if (result.capsuleGained) {
                    newSessionGains.capsules.push(result.capsuleGained);
                }
                const newLog = [...prev.log, ...result.log.map(l => `[${new Date().toLocaleTimeString()}] ${l}`), logMessage];
                return { ...prev, log: newLog, sessionGains: newSessionGains };
            });
    
            setShips(prev => prev.map(s => s.id === autoShip.id ? { ...s, stats: { ...s.stats, integrity: Math.max(0, s.stats.integrity - result.integrityLost) } } : s));
            setActiveExpeditions(prev => prev.filter(e => e.id !== currentAutoExp.id));
            autoPilotCycleIndex.current++;
        }
    };
    
    const savedAutoPilotTick = useRef(autoPilotTick);
    useEffect(() => {
        savedAutoPilotTick.current = autoPilotTick;
    });
    
    useEffect(() => {
        if (!autoPilotState.active) {
            return;
        }
        const intervalId = setInterval(() => savedAutoPilotTick.current(), 1000);
        return () => clearInterval(intervalId);
    }, [autoPilotState.active]);


    const totalInventoryValue = useMemo(() => {
        let totalValue = 0;
        // Resources
        for (const key in resources) {
            const def = RESOURCE_DEFINITIONS[key];
            if (def && def.baseSellPrice > 0) {
                totalValue += (resources[key] || 0) * def.baseSellPrice;
            }
        }
        // Items
        inventory.forEach(item => {
            totalValue += RARITY_SELL_VALUES[item.rarity] || 0;
        });
        return totalValue;
    }, [resources, inventory]);

    // Main render
    const renderGameContent = () => {
        switch (gameState) {
            case GameStateEnum.Game:
                return <GameScreen 
                            locations={LOCATIONS} 
                            ships={ships}
                            defendingShipId={defendingShipId}
                            onExplore={handleExplore} 
                            activeExpeditions={activeExpeditions.filter(e => !e.isAuto)} 
                            currentTime={currentTime}
                            onCompleteExpedition={handleCompleteExpedition}
                            expeditionResult={expeditionResult}
                            onClaimRewards={handleClaimRewards}
                            activeShipStats={activeShip?.stats || null}
                            resources={resources}
                            onResolveEvent={handleResolveEvent}
                        />;
            case GameStateEnum.DeepSpace:
                return <DeepSpaceScreen
                            locations={DEEP_SPACE_LOCATIONS}
                            ships={ships}
                            activeExpeditions={activeDeepSpaceExpeditions}
                            activeRegularExpeditionShipIds={[...activeExpeditions.map(e => e.shipId), defendingShipId].filter(Boolean) as string[]}
                            currentTime={currentTime}
                            onStartExpedition={handleStartDeepSpaceExpedition}
                        />;
            case GameStateEnum.Shop:
                return <ShopScreen 
                            resources={resources} 
                            playerState={playerState}
                            onSellResource={handleSellResource}
                            onBuyShipBox={handleBuyShipBox}
                            onBuyShield={handleBuyShield}
                            onBuyAutopilotModule={handleBuyAutopilotModule}
                            onBuyConsumable={handleBuyConsumable}
                        />;
            case GameStateEnum.AutoPilot:
                return <AutoPilotScreen
                            autoPilotState={autoPilotState}
                            ships={ships}
                            locations={LOCATIONS}
                            activeExpeditions={activeExpeditions}
                            activeDeepSpaceExpeditions={activeDeepSpaceExpeditions}
                            defendingShipId={defendingShipId}
                            onStart={handleStartAutopilot}
                            onStop={handleStopAutopilot}
                            report={autoPilotReport}
                            onClearReport={() => setAutoPilotReport(null)}
                        />;
            case GameStateEnum.Upgrades:
                return <UpgradeScreen 
                            activeShip={activeShip}
                            resources={resources}
                            playerState={playerState}
                            onCraftUpgrade={handleCraftUpgrade}
                            onDistributePoint={handleDistributePoint}
                        />;
            case GameStateEnum.Inventory:
                 return <InventoryScreen 
                            inventory={inventory} 
                            capsules={capsules}
                            ships={ships}
                            shipBoxes={shipBoxes}
                            resources={resources}
                            activeShipId={activeShipId}
                            defendingShipId={defendingShipId}
                            totalInventoryValue={totalInventoryValue}
                            onSellItem={handleSellItem}
                            onOpenCapsule={handleOpenCapsule}
                            onOpenShipBox={handleOpenShipBox}
                            onSetActiveShip={handleSetActiveShip}
                            onSetDefendingShip={handleSetDefendingShip}
                            onUseConsumable={handleUseConsumable}
                        />;
            case GameStateEnum.Missions:
                return <MissionScreen
                            missionState={missionState}
                            resources={resources}
                            onAcceptMission={handleAcceptMission}
                            onAbandonMission={handleAbandonMission}
                            onClaimMissionReward={handleClaimMissionReward}
                        />;
            case GameStateEnum.Farm:
                 if (!farmState.unlocked) {
                    if (!showFarmUnlock) {
                        setShowFarmUnlock(true);
                    }
                    return <div className="ui-panel p-6 text-center"><h2 className="text-2xl font-title">BIODOMO BLOQUEADO</h2></div>;
                }
                return <FarmScreen 
                    farmState={farmState}
                    resources={resources}
                    currentTime={currentTime}
                    onPlant={handlePlant}
                    onHarvest={handleHarvest}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-screen text-slate-200 p-2 sm:p-4 flex flex-col items-center gap-4">
            {gameState !== GameStateEnum.MainMenu && (
                <Header 
                    resources={resources} 
                    playerState={playerState}
                    activeShipStats={activeShip?.stats || null}
                    setGameState={setGameState}
                    activeState={gameState}
                    farmState={farmState}
                    onSaveAndExit={handleSaveAndExit}
                />
            )}
            <main className="w-full max-w-7xl">
                {gameState === GameStateEnum.MainMenu ? (
                    <MainMenu onStartGame={handleLoadGame} />
                ) : (
                    renderGameContent()
                )}
            </main>
            {capsuleResult && (
                <CapsuleResultModal 
                    results={capsuleResult.results} 
                    rarity={capsuleResult.rarity}
                    onClose={() => setCapsuleResult(null)} 
                />
            )}
            {shipResult && (
                <ShipResultModal
                    ship={shipResult}
                    onClose={() => setShipResult(null)}
                />
            )}
            {showFarmUnlock && <FarmUnlockModal onConfirm={handleUnlockFarm} cost={farmUnlockCost} />}
        </div>
    );
};

export default App;