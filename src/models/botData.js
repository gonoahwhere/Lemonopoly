import mongoose from 'mongoose';
const { Schema } = mongoose;

const BotStatsSchema = new Schema({
    name: { type: String, default: 'bot_statistics' },
    slashCmds: { type: Number, default: 0 },
    userCount: { type: Number, default: 0 },
    standCount: { type: Number, default: 0 },
    cupsSold: { type: Number, default: 0 },
    customersServed: { type: Number, default: 0 },
    guildCount: { type: Number, default: 0 },
    commandCount: { type: Number, default: 0 },
    shardCount: { type: Number, default: 0 },
});

export default mongoose.model('BotStats', BotStatsSchema);