'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const env = require('./src/config/env');

mongoose.connect(env.MONGODB_URI).then(async () => {
  const newHash = await bcrypt.hash('demo1234', 12);
  const result = await User.updateMany(
    { email: { $in: [
      'rohan@patient.demo','sneha@patient.demo','amit@patient.demo',
      'dr.priya@healthsync.demo','dr.vikramaditya@healthsync.demo','dr.arjun@healthsync.demo',
      'dr.nandini@healthsync.demo','dr.ananya@healthsync.demo','dr.rohan.derma@healthsync.demo',
      'dr.rahul@healthsync.demo','dr.shweta@healthsync.demo','dr.meera@healthsync.demo',
      'dr.siddharth@healthsync.demo','dr.vikram@healthsync.demo','dr.sunita@healthsync.demo',
    ]}},
    { $set: { passwordHash: newHash } }
  );
  console.log(`✅ Reset ${result.modifiedCount} users → password: demo1234`);
  const adminHash = await bcrypt.hash('admin1234', 12);
  const ar = await User.updateMany({ role: 'admin' }, { $set: { passwordHash: adminHash } });
  console.log(`✅ Reset ${ar.modifiedCount} admin(s) → password: admin1234`);
  mongoose.disconnect();
  console.log('Done.');
}).catch(e => { console.error(e.message); process.exit(1); });
