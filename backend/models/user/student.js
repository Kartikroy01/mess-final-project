// models/Student.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    hostelNo: {
        type: String,
        required: true
    },
    roomNo: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: 'https://placehold.co/100x100/3B82F6/FFF?text=ST'
    },
    qrCode: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    
    // Generate QR code if not exists
    if (!this.qrCode) {
        this.qrCode = `${this.rollNo}${this.hostelNo}`;
    }
    next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);

// models/MealHistory.js
const mealHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
        required: true
    },
    items: [{
        name: String,
        qty: Number,
        price: Number
    }],
    totalCost: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
mealHistorySchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);

// models/MessOff.js
const messOffSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    meals: [{
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner']
    }],
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('MessOff', messOffSchema);

// models/Feedback.js
const feedbackSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
        required: true
    },
    mealItem: {
        type: String,
        trim: true
    },
    rating: {
        type: String,
        enum: ['Good', 'Average', 'Bad', 'Very Bad'],
        required: true
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

// models/Menu.js
const menuSchema = new mongoose.Schema({
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
        required: true
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            default: 0
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);

// models/Bill.js
const billSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    mealCharges: {
        type: Number,
        default: 0
    },
    fines: {
        type: Number,
        default: 0
    },
    extras: {
        type: Number,
        default: 0
    },
    totalBill: {
        type: Number,
        required: true
    },
    mealCount: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for unique bill per student per month
billSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);