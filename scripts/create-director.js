const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#\s]+)\s*=\s*(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  const email = 'director@radiologiaconfe.com';
  const password = 'RadiologiaAdmin2024!';
  const fullName = 'Director Francisco Jáquez';

  console.log(`Creating or updating admin user: ${email}...`);

  // 1. Create or update user in auth.users
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'ADMIN'
    }
  });

  if (userError) {
    if (userError.code === 'email_exists' || userError.message.toLowerCase().includes('already')) {
      console.log('User already exists. Attempting to get user to update role...');
      
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users.find(u => u.email === email);
      
      if (existingUser) {
        // Update password just to be sure
        await supabase.auth.admin.updateUserById(existingUser.id, { password, user_metadata: { role: 'ADMIN', full_name: fullName } });
        
        // Update role in profiles table
        await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', existingUser.id);
        console.log('User exists. Password reset and role set to ADMIN.');
      }
    } else {
      console.error('Error creating user:', userError);
      process.exit(1);
    }
  } else {
    // Note: The handle_new_user trigger creates the profile.
    // Wait a brief moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Make sure role is ADMIN in profiles table
    const { error: profileError } = await supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', user.user.id);
    
    if (profileError) {
      console.error('Error updating profile role:', profileError);
    } else {
      console.log('Profile updated to ADMIN successfully.');
    }
  }

  console.log(`
=========================================
✅ ADMINISTRADOR CREADO CON ÉXITO
=========================================
Email:      ${email}
Contraseña: ${password}
=========================================
`);
}

createAdmin();
