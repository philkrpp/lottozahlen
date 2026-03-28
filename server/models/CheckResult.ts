import mongoose, { Schema, type Document } from 'mongoose'

export interface ICheckResult extends Document {
  userId: mongoose.Types.ObjectId
  losId: mongoose.Types.ObjectId
  drawId: mongoose.Types.ObjectId | null
  hasWon: boolean
  prize: string | null
  prizeAmount: number | null
  rawApiResponse: unknown
  checkedAt: Date
  checkType: string
  notificationSent: boolean
  notificationSentAt: Date | null
}

const CheckResultSchema = new Schema<ICheckResult>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
  },
  losId: {
    type: Schema.Types.ObjectId,
    ref: 'Los',
    index: true,
  },
  drawId: {
    type: Schema.Types.ObjectId,
    ref: 'Draw',
    default: null,
  },
  rawApiResponse: {
    type: Schema.Types.Mixed,
    default: null,
  },
  hasWon: {
    type: Boolean,
  },
  prize: {
    type: String,
    default: null,
  },
  prizeAmount: {
    type: Number,
    default: null,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
  checkType: {
    type: String,
    enum: ['automatic', 'manual'],
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  notificationSentAt: {
    type: Date,
    default: null,
  },
})

export default mongoose.models.CheckResult ||
  mongoose.model<ICheckResult>('CheckResult', CheckResultSchema)
