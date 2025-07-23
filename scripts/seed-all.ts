import { execSync } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function runScript(scriptName: string, description: string) {
  try {
    execSync(`npm run ${scriptName}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error(` ${description} sırasında hata:`, error.message);
    throw error;
  }
}

async function seedAll() {
  try {
    // 1. Kategorileri oluştur
    await runScript('create-categories', 'Kategoriler oluşturuluyor');

    // 2. Satıcıları, müşterileri, ürünleri ve review'leri oluştur
    await runScript('create-sellers-products', 'Satıcılar, müşteriler, ürünler ve review\'ler oluşturuluyor');

    // 3. Platform kampanyalarını oluştur
    await runScript('create-platform-campaigns', 'Platform kampanyaları oluşturuluyor');

    // 4. Satıcı kampanyalarını oluştur
    await runScript('create-seller-campaigns', 'Satıcı kampanyaları oluşturuluyor');


  } catch (error) {
    console.error('\n Veri oluşturma sırasında hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
seedAll().catch(console.error);
