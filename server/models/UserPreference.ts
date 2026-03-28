import mongoose, { Schema, type Document } from 'mongoose'

export interface IUserPreference extends Document {
  userId: mongoose.Types.ObjectId
  theme: string
  dashboardLayout: string
  showInactiveLose: boolean
  defaultAnbieter: string | null
  language: string
  createdAt: Date
  updatedAt: Date
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    dashboardLayout: {
      type: String,
      enum: ['grid', 'list'],
      default: 'grid',
    },
    showInactiveLose: {
      type: Boolean,
      default: false,
    },
    defaultAnbieter: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: 'de',
    },
  },
  { timestamps: true },
)

export default mongoose.models.UserPreference || mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema)
