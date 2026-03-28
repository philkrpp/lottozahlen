import mongoose, { Schema, type Document } from 'mongoose'

export interface IDrawResults {
  winningNumbers: string[]
  additionalData?: Record<string, unknown>
}

export interface IDraw extends Document {
  anbieter: string
  drawDate: Date
  drawType: string
  results: IDrawResults
  rawResponse: unknown
  fetchedAt: Date
  createdAt: Date
  updatedAt: Date
}

const DrawSchema = new Schema<IDraw>(
  {
    anbieter: {
      type: String,
      enum: ['deutsche-fernsehlotterie'],
      required: true,
      index: true,
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
)

DrawSchema.index({ anbieter: 1, drawDate: 1 }, { unique: true })

export default mongoose.models.Draw || mongoose.model<IDraw>('Draw', DrawSchema)
