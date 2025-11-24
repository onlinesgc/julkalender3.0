import { model, Schema } from "mongoose";

const ClientSchema = new Schema({
    discordClientId: { type: String, required: true, unique: true, autoIndex: true },
    adventchannel: { type: String, required: false },
    adventPingRole: { type: String, required: false },
});

const ClientModel = model("Client", ClientSchema);

export const getClientById = async (discordClientId: string) => {
    return await ClientModel.findOne({ discordClientId });
}

export const createClient = async (discordClientId: string) => {
    const client = new ClientModel({ discordClientId });
    return await client.save();
}