import mongoose, { Schema, type Document } from 'mongoose'

export interface ILastCheckResult {
  hasWon: boolean
  prize: string | null
  drawDate: Date
  checkedAt: Date
}

export interface ILos extends Document {
  userId: mongoose.Types.ObjectId
  losNummer: string
  anbieter: string
  losTyp: string
  displayName?: string
  isActive: boolean
  lastCheckedAt: Date | null
  lastManualCheckAt: Date | null
  lastCheckResult: ILastCheckResult | null
  createdAt: Date
  updatedAt: Date
}

const LastCheckResultSchema = new Schema<ILastCheckResult>(
  {
    hasWon: { type: Boolean, required: true },
    prize: { type: String, default: null },
    drawDate: { type: Date, required: true },
    checkedAt: { type: Date, required: true },
  },
  { _id: false },
)

const LosSchema = new Schema<ILos>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    losNummer: {
      type: String,
      required: true,
    },
    anbieter: {
      type: String,
      enum: ['deutsche-fernsehlotterie'],
      required: true,
    },
    losTyp: {
      type: String,
      enum: ['mega-los', 'jahreslos', 'dauerlos', 'einzellos'],
      required: true,
    },
    displayName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    lastManualCheckAt: {
      type: Date,
      default: null,
    },
    lastCheckResult: {
      type: LastCheckResultSchema,
      default: null,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Los || mongoose.model<ILos>('Los', LosSchema)
