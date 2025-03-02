import express, { Request, Response, NextFunction } from 'express';
import mongoose, { Document, Schema, Model } from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/dogcafe6ix', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key';

// Interfaces for Models
interface IUser extends Document {
  email: string;
  username?: string;
  profilePicture?: string;
  createdAt: Date;
}

interface IVerificationCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

interface IPlan extends Document {
  name: string;
  price: number;
  description: string;
  duration: number;
  maxDogs: number;
  image?: string;
}

interface IBooking extends Document {
  user: Schema.Types.ObjectId;
  plan: Schema.Types.ObjectId;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  createdAt: Date;
}

interface IPost extends Document {
  user: Schema.Types.ObjectId;
  content: string;
  image?: string;
  likes: Schema.Types.ObjectId[];
  comments: {
    user: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
}

// Mongoose Schemas
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const VerificationCodeSchema = new Schema<IVerificationCode>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const PlanSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  maxDogs: { type: Number, required: true },
  image: { type: String },
});

const BookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  specialRequests: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', UserSchema);
const VerificationCode = mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
const Post = mongoose.model<IPost>('Post', PostSchema);

// Authentication Middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    (req as any).user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }
    
    res.status(200).json({ message: 'User signed in' });
  } catch (err) {
    console.error('Sign in error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});