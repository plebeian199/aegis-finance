import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = join(__dirname, '..', '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  // INCOME CATEGORIES
  { name: '💼 Gaji Utama', type: 'income', grouping: 'Pendapatan Utama', is_essential: false, is_fixed: false },
  { name: '💰 Bonus/Tunjangan', type: 'income', grouping: 'Pendapatan Utama', is_essential: false, is_fixed: false },
  { name: '📈 Hasil Investasi', type: 'income', grouping: 'Pasif/Sampingan', is_essential: false, is_fixed: false },
  { name: '🚀 Bisnis Sampingan', type: 'income', grouping: 'Pasif/Sampingan', is_essential: false, is_fixed: false },
  { name: '🎁 Hadiah/Transfer Masuk', type: 'income', grouping: 'Pasif/Sampingan', is_essential: false, is_fixed: false },
  
  // EXPENSE CATEGORIES
  // Tempat Tinggal & Utilitas
  { name: '🏠 Sewa/KPR', type: 'expense', grouping: 'Tempat Tinggal & Utilitas', is_essential: true, is_fixed: true },
  { name: '⚡ Listrik/Air', type: 'expense', grouping: 'Tempat Tinggal & Utilitas', is_essential: true, is_fixed: true },
  { name: '🌐 Internet/Telepon', type: 'expense', grouping: 'Tempat Tinggal & Utilitas', is_essential: true, is_fixed: true },
  { name: '🛠️ Perawatan Rumah', type: 'expense', grouping: 'Tempat Tinggal & Utilitas', is_essential: true, is_fixed: true },
  
  // Transportasi
  { name: '⛽ Bensin/BBM', type: 'expense', grouping: 'Transportasi', is_essential: true, is_fixed: false },
  { name: '🚇 Transportasi Umum', type: 'expense', grouping: 'Transportasi', is_essential: true, is_fixed: false },
  { name: '🚗 Servis Kendaraan', type: 'expense', grouping: 'Transportasi', is_essential: true, is_fixed: false },
  { name: '🅿️ Parkir/Tol', type: 'expense', grouping: 'Transportasi', is_essential: true, is_fixed: false },

  // Kebutuhan Harian
  { name: '🛒 Belanja Harian/Grosir', type: 'expense', grouping: 'Kebutuhan Harian', is_essential: true, is_fixed: false },
  { name: '🏥 Kesehatan/Medis', type: 'expense', grouping: 'Kebutuhan Harian', is_essential: true, is_fixed: false },
  { name: '🧴 Perawatan Diri', type: 'expense', grouping: 'Kebutuhan Harian', is_essential: true, is_fixed: false },
  { name: '🐾 Keperluan Hewan', type: 'expense', grouping: 'Kebutuhan Harian', is_essential: true, is_fixed: false },

  // Kewajiban Finansial
  { name: '🛡️ Premi Asuransi', type: 'expense', grouping: 'Kewajiban Finansial', is_essential: true, is_fixed: true },
  { name: '💳 Cicilan Utang', type: 'expense', grouping: 'Kewajiban Finansial', is_essential: true, is_fixed: true },
  { name: '🏛️ Pajak/Zakat', type: 'expense', grouping: 'Kewajiban Finansial', is_essential: true, is_fixed: true },

  // Gaya Hidup & Opsional
  { name: '🍽️ Makan di Luar/Resto', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false },
  { name: '🍿 Hiburan/Langganan', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false },
  { name: '🛍️ Belanja (Baju/Gadget)', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false },
  { name: '🎮 Hobi/Rekreasi', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false },
  { name: '✈️ Liburan/Travel', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false },
  { name: '💝 Sedekah/Hadiah', type: 'expense', grouping: 'Gaya Hidup & Opsional', is_essential: false, is_fixed: false }
];

async function seed() {
  console.log("Truncating old categories...");
  // Assuming RLS allows delete. However, due to FK we should probably cascade, but REST API delete doesn't cascade well if restricted.
  // Actually, we can just delete from cash_flow_categories. Note: If we have transactions referencing this, they'd become set null.
  const { error: delError } = await supabase.from('cash_flow_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.error("Failed to delete categories", delError);
  }

  console.log("Inserting new translated emoji categories...");
  const { error } = await supabase.from('cash_flow_categories').insert(categories);
  if (error) {
    console.error("Failed to insert", error);
  } else {
    console.log("Categories successfully seeded!");
  }
}

seed();
