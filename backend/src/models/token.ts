import { Schema, InferSchemaType, model } from 'mongoose';

const tokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true},
    token: { type: String, required: true},
});

type Token = InferSchemaType<typeof tokenSchema>;

export default model<Token>("Token", tokenSchema);