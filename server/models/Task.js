import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
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
  { timestamps: true, versionKey: false },
);

taskSchema.index({ scheduledAt: 1 });

export default mongoose.model('Task', taskSchema);
