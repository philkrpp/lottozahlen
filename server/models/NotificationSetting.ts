import mongoose, { Schema, type Document } from 'mongoose'

export interface INotificationSetting extends Document {
  userId: mongoose.Types.ObjectId
  emailEnabled: boolean
  emailAddress: string
  slackEnabled: boolean
  slackWebhookUrl: string | null
  notifyOnWin: boolean
  notifyOnNoWin: boolean
  notifyOnNewDraw: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSettingSchema = new Schema<INotificationSetting>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true,
      index: true,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    emailAddress: {
      type: String,
    },
    slackEnabled: {
      type: Boolean,
      default: false,
    },
    slackWebhookUrl: {
      type: String,
      default: null,
    },
    notifyOnWin: {
      type: Boolean,
      default: true,
    },
    notifyOnNoWin: {
      type: Boolean,
      default: false,
    },
    notifyOnNewDraw: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.NotificationSetting || mongoose.model<INotificationSetting>('NotificationSetting', NotificationSettingSchema)
