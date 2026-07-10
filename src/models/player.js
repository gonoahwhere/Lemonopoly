import mongoose from 'mongoose';
const { Schema } = mongoose;
const HEX_COLOUR_RE = /^#[0-9A-Fa-f]{6}$/;

const IngredientStock = new Schema(
    {
        key: { type: String, required: true },
        quantity: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 50, min: 1 },
    },
    { _id: false }
);

const DrinkStock = new Schema(
    {
        key: { type: String, required: true },
        quantity: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 40, min: 1 },
    },
    { _id: false }
);

const RecipeProgress = new Schema(
    {
        customersServed: { type: Number, default: 0, min: 0 },
        revenueEarned: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const UnlockedRecipe = new Schema(
    {
        key: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        timesServed: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: false },
        rarity: {
            type: String,
            enum: [
                'common', 'uncommon', 'rare', 'epic', 'legendary',
                'mythic', 'divine', 'cosmic', 'transcendent', 'ancient',
                'primal', 'eternal', 'exotic',
            ],
            default: 'common',
        },
        stars: { type: Number, default: 0, min: 0, max: 5 },
        progress: { type: RecipeProgress, default: () => ({}) },
    },
    { _id: false }
);

const UpgradeTrack = new Schema(
    {
        level: { type: Number, default: 0, min: 0 },
        purchasedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const StaffMember = new Schema(
    {
        staffId: { type: Schema.Types.ObjectId, auto: true },
        key: { type: String, required: true },
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['server', 'restocker', 'collector', 'marketer'],
            required: true,
        },
        level: { type: Number, default: 1, min: 1 },
        hiredAt: { type: Date, default: Date.now },
        perk: {
            type: { type: String },
            value: { type: Number },
        },
    },
    { _id: false }
);

const ActiveEvent = new Schema(
    {
        key: {
            type: String,
            enum: [
                'heatwave',
                'local_festival',
                'sudden_rain',
                'thunderstorm',
                'wind_storm',
                'weekend_rush',
            ],
            default: null,
        },
        startedAt: { type: Date, default: null },
        endsAt: { type: Date, default: null },
        effects: { type: Schema.Types.Mixed, default: {} },
        choiceMade: { type: String, default: null },
    },
    { _id: false }
);

const EventHistoryEntry = new Schema(
    {
        key: { type: String, required: true },
        occurredAt: { type: Date, default: Date.now },
        outcome: { type: String },
    },
    { _id: false }
);

const Achievement = new Schema(
    {
        key: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const ActiveQuest = new Schema(
    {
        key: { type: String, required: true },
        progress: { type: Number, default: 0, min: 0 },
        target: { type: Number, required: true },
        startedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const CompletedQuest = new Schema(
    {
        key: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const Customization = new Schema(
    {
        cardBorderColours: {
            type: [String],
            default: [],
            validate: {
                validator: function (arr) {
                    return arr.length <= 3 && arr.every((c) => HEX_COLOUR_RE.test(c));
                },
                message: 'cardBorderColours must contain 1-3 valid hex colours (e.g. "#FF6B00")',
            },
        },
        nameGradientColours: {
            type: [String],
            default: [],
            validate: {
                validator: function (arr) {
                    return (arr.length === 0 || arr.length === 2) && arr.every((c) => HEX_COLOUR_RE.test(c));
                },
                message: 'nameGradientColours must be empty or contain exactly 2 valid hex colours (e.g. "#FF6B00")',
            },
        },
    },
    { _id: false },
)

const Player = new Schema(
    {
        // Identity
        discordId: { type: String, required: true, unique: true },
        username: { type: String, required: true },

        // Stand
        stand: {
            name: { 
                type: String, 
                default: 'Unidentified Stand', 
                maxlength: 32 
            },
            location: { 
                type: String, 
                default: 'Suburban Sidewalk' 
            },
            theme: {
                type: String,
                enum: ['lemonade', 'ice_cream', 'both'],
                default: 'lemonade',
            },
            level: { type: Number, default: 1, min: 1 },
            health: { type: Number, default: 100, min: 0, max: 100 },
            repairCost: { type: Number, default: 0, min: 0 },
            createdAt: { type: Date, default: Date.now },
            lastCollectedAt: { type: Date, default: Date.now },
            lastActiveAt: { type: Date, default: Date.now },
            lastSoldAt: { type: Date, default: null },
        },

        // Economy
        economy: {
            cash: { type: Number, default: 50, min: 0 },
            coins: { type: Number, default: 0, min: 0 },
            lifetimeEarned: {
                cash: { type: Number, default: 0, min: 0 },
                coins: { type: Number, default: 0, min: 0 },
            },
            lifetimeSpent: {
                cash: { type: Number, default: 0, min: 0 },
                coins: { type: Number, default: 0, min: 0 },
            },
        },

        // Ingredients
        ingredients: {
            type: [IngredientStock],
            default: () => [
                { key: 'lemon', quantity: 20, capacity: 40 },
                { key: 'white_sugar', quantity: 20, capacity: 40 },
                { key: 'ice', quantity: 20, capacity: 40 },
                { key: 'water', quantity: 20, capacity: 40 },
            ],
        },

        // Drinks
        drinks: {
            type: [DrinkStock],
            default: [],
        },

        // Recipes
        recipes: {
            unlocked: {
                type: [UnlockedRecipe],
                default: () => [
                    { key: 'classic_lemonade', isActive: true },
                ],
            },
            activeSlotLimit: { type: Number, default: 1, min: 1 },
        },

        // Upgrades
        upgrades: {
            speed: { type: UpgradeTrack, default: () => ({ level: 0 }) },
            storage: { type: UpgradeTrack, default: () => ({ level: 0 }) },
            resilience: { type: UpgradeTrack, default: () => ({ level: 0 }) },
            appeal: { type: UpgradeTrack, default: () => ({ level: 0 }) },
        },

        // Entitlements
        entitlements: {
            premium: { type: Boolean, default: false },
            seasonal: { type: Boolean, default: false },
            betaTester: { type: Boolean, default: false },
        },

        // Staff
        staff: { type: [StaffMember], default: [] },

        // Customers / Stats
        customers: {
            totalServed: { type: Number, default: 0, min: 0 },
            totalTipsEarned: { type: Number, default: 0, min: 0 },
            byType: {
                tourists: { type: Number, default: 0, min: 0 },
                kids: { type: Number, default: 0, min: 0 },
                workers: { type: Number, default: 0, min: 0 },
                rich: { type: Number, default: 0, min: 0 },
                angry: { type: Number, default: 0, min: 0 },
            },
            cupsSold: { type: Number, default: 0, min: 0 },
        },

        // Events
        events: {
            active: { type: ActiveEvent, default: () => ({}) },
            nextEventAt:  { type: Date, default: null },
            history: { type: [EventHistoryEntry], default: [] },
        },

        // Prestige
        prestige: {
            level: { type: Number, default: 0, min: 0 },
            lifetimeMultiplier: {
                income: { type: Number, default: 1, min: 1 },
                ingredientDiscount: { type: Number, default: 0.0, min: 0, max: 0.9 },
            },
            lastPrestigeAt: { type: Date, default: null },
            badges: { type: [String], default: [] },
        },

        // Achievements
        achievements: { type: [Achievement], default: [] },

        // Quests
        quests: {
            active: { type: [ActiveQuest], default: [] },
            completed: { type: [CompletedQuest], default: [] },
        },

        // Customization
        customization: { type: Customization, default: () => ({}) },

        premiumBonuses: {
            recipeTickets: { type: Boolean, default: 0 },
            premiumTokens: { type: Boolean, default: 0 },
            storageExpansion: { type: Boolean, default: 0 },
            standRepair: { type: Boolean, default: 0 },
            levelSkip: { type: Boolean, default: 0 },
            ingredientCrate: { type: Boolean, default: 0 },
            giftToken: { type: Boolean, default: 0 },
            freeStaff: { type: Boolean, default: 0 },
        },

        // Settings
        settings: {
            visibleLeaderboardBadge: { type: Boolean, default: true },
            notificationsEnabled: { type: Boolean, default: false },
            timezone: { type: String, default: 'UTC' },
            leaderboardOptIn: { type: Boolean, default: false },
            autoServe: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true
    }
);

const PlayerProfile = mongoose.model('PlayerProfile', Player, 'player_profiles');

export default PlayerProfile;