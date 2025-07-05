// controllers/userController.js
import User from '../models/User.js';

export async function listUsers(req, res) {
  const users = await User.find({}, 'username email createdAt updatedAt');
  res.json(users);
}
