import mongoose from 'mongoose';
import { UserModel } from './src/modules/users/models/UserModel';
import TokenUtility from './src/shared/utils/TokenUtility';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/stayos-dev');
  
  // create super admin
  const user = await UserModel.create({
    name: 'Super Admin',
    email: 'superadmin@stayos.com',
    passwordHash: 'dummy',
    isSuperAdmin: true,
    organizations: []
  });

  const token = TokenUtility.generateAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    organizations: []
  });

  console.log('Token:', token);
  
  const response = await fetch('http://localhost:5000/api/v1/admin/hotels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Whispering Palms Luxury Resort',
      type: 'RESORT',
      baseRoomPrice: 2999,
      email: 'reservations@hotel.com',
      phone: '+91 98765 00000',
      templateLayout: 'luxury'
    })
  });
  
  const data = await response.json();
  console.log('Response:', data);
  
  process.exit(0);
}
test().catch(console.error);
