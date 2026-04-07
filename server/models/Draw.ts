import mongoose, { Schema, type Document } from "mongoose";

export interface IDrawGewinn {
	anzahlGewinner: number;
	gewinn: string;
	gewinnArt: number;
	gewinnzahl: string;
	rang: number;
}

export interface IDrawResults {
	winningNumbers: string[];
	gewinne?: IDrawGewinn[];
	additionalData?: Record<string, unknown>;
}

export interface IDraw extends Document {
	anbieter: string;
	externalId?: string;
	drawDate: Date;
	drawType: string;
	results: IDrawResults;
	rawResponse: unknown;
	fetchedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const DrawGewinnSchema = new Schema<IDrawGewinn>(
	{
		anzahlGewinner: { type: Number },
		gewinn: { type: String },
		gewinnArt: { type: Number },
		gewinnzahl: { type: String },
		rang: { type: Number },
	},
	{ _id: false },
);

const DrawSchema = new Schema<IDraw>(
	{
		anbieter: {
			type: String,
			enum: ["deutsche-fernsehlotterie"],
			required: true,
			index: true,
		},
		externalId: {
			type: String,
		},
		drawDate: {
			type: Date,
			required: true,
			index: true,
		},
		drawType: {
			type: String,
		},
		results: {
			winningNumbers: { type: [String] },
			gewinne: { type: [DrawGewinnSchema] },
			additionalData: { type: Schema.Types.Mixed },
		},
		rawResponse: {
			type: Schema.Types.Mixed,
		},
		fetchedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

DrawSchema.index({ anbieter: 1, externalId: 1 }, { unique: true, sparse: true });
DrawSchema.index({ anbieter: 1, drawDate: 1 });

export default mongoose.models.Draw || mongoose.model<IDraw>("Draw", DrawSchema);
