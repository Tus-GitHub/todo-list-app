import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    ownerKey: { type: String, required: true, select: false },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, default: '', maxlength: 3000 },
    scheduledAt: { type: Date, required: true },
    endAt: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          return !value || value > this.scheduledAt;
        },
        message: 'End time must be after the start time.',
      },
    },
    priority: { type: String, enum: ['', 'Low', 'Medium', 'High'], default: '' },
    status: {
      type: String,
      enum: ['In Progress', 'Completed'],
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, result) {
        delete result.ownerKey;
        return result;
      },
    },
  },
);

taskSchema.index({ ownerKey: 1, scheduledAt: 1 });

export default mongoose.model('Task', taskSchema);
