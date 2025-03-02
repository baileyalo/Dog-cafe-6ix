const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key';

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours
  maxDogs: { type: Number, required: true },
  image: { type: String },
});

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  specialRequests: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
const Plan = mongoose.model('Plan', planSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Post = mongoose.model('Post', postSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Routes

// Auth routes
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ email });
      await user.save();
    }
    
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Code expires in 15 minutes
    
    // Save verification code
    await VerificationCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );
    
    // In a real app, you would send the code via email
    // For this example, we'll just log it to the console
    console.log(`Verification code for ${email}: ${code}`);
    
    res.status(200).json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Sign in error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    
    // Find verification code
    const verification = await VerificationCode.findOne({ email });
    
    if (!verification || verification.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ message: 'Verification code expired' });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ email });
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Delete verification code
    await VerificationCode.deleteOne({ email });
    
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/users/me', authenticate, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { username, profilePicture } = req.body;
    
    const updates = {};
    if (username) updates.username = username;
    if (profilePicture) updates.profilePicture = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Plan routes
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json(plans);
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.status(200).json(plan);
  } catch (err) {
    console.error('Get plan error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking routes
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const { plan, date, time, specialRequests } = req.body;
    
    if (!plan || !date || !time) {
      return res.status(400).json({ message: 'Plan, date, and time are required' });
    }
    
    const booking = new Booking({
      user: req.user._id,
      plan,
      date,
      time,
      specialRequests,
      status: 'confirmed', // Auto-confirm for this example
    });
    
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('plan')
      .populate('user');
    
    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings/user', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('plan')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Get user bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json(booking);
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post routes
app.post('/api/posts', authenticate, async (req, res) => {
  try {
    const { content, image } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const post = new Post({
      user: req.user._id,
      content,
      image,
    });
    
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userIdString = req.user._id.toString();
    const likeIndex = post.likes.findIndex(id => id.toString() === userIdString);
    
    if (likeIndex === -1) {
      // Add like
      post.likes.push(req.user._id);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.user._id,
      content,
    });
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username profilePicture');
    
    res.status(200).json({ comments: updatedPost.comments });
  } catch (err) {
    console.error('Comment on post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default plans
const initializePlans = async () => {
  try {
    const count = await Plan.countDocuments();
    
    if (count === 0) {
      const plans = [
        {
          name: 'Plan A',
          price: 50,
          description: '1-hour visit with any dog of your choice, includes a beverage',
          duration: 1,
          maxDogs: 1,
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
        {
          name: 'Plan B',
          price: 70,
          description: '2-hour visit with any 2 dogs, includes a beverage and snack',
          duration: 2,
          maxDogs: 2,
          image: 'https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
        {
          name: 'Plan C',
          price: 100,
          description: '3-hour visit with any 3 dogs, includes full meal and priority booking',
          duration: 3,
          maxDogs: 3,
          image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        },
      ];
      
      await Plan.insertMany(plans);
      console.log('Default plans created');
    }
  } catch (err) {
    console.error('Error initializing plans:', err);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializePlans();
});