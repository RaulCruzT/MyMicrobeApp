import { InferSchemaType, model, Schema } from "mongoose";

const actinobacteriaSchema = new Schema({
    scientificName: {type: String, required: true},
    designation: {type: String, required: true},
}, { timestamps: true });

type Actinobacteria = InferSchemaType<typeof actinobacteriaSchema>;

export default model<Actinobacteria>("Actinobacteria", actinobacteriaSchema);