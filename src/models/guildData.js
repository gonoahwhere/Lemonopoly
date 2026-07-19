import mongoose from 'mongoose';
const { Schema } = mongoose;

const GuildStatsSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String, default: 'Unknown' },
    ownerId: { type: String, default: 'Unknown' },
    ownerTag: { type: String, default: 'Unknown' },
});

export default mongoose.model('GuildStats', GuildStatsSchema);