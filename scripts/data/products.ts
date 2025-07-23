export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryName: string;
  specifications: Record<string, string>;
  tags: string[];
  variants: Array<{
    color?: string;
    size?: string;
    stock: number;
    price: number;
  }>;
  isFeatured: boolean;
}

export const productsByCategory = {
  'Electronics': [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Apple iPhone 15 Pro Max 256GB Titanium, A17 Pro chip, 48MP kamera, 5G desteği',
      price: 89999,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '6.7" Super Retina XDR OLED',
        'İşlemci': 'A17 Pro chip',
        'RAM': '8GB',
        'Depolama': '256GB',
        'Kamera': '48MP Ana + 12MP Ultra Geniş + 12MP Telefoto',
        'Pil': '4441mAh',
        'İşletim Sistemi': 'iOS 17',
        'Bağlantı': '5G, Wi-Fi 6E, Bluetooth 5.3',
        'Su Geçirmezlik': 'IP68'
      },
      tags: ['iPhone', 'Apple', '5G', 'Pro', 'Titanium', 'Premium'],
      variants: [
        { color: 'Titanium', size: '256GB', stock: 30, price: 89999 },
        { color: 'Titanium', size: '512GB', stock: 20, price: 99999 }
      ],
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra 512GB, S Pen desteği, 200MP kamera, 5G',
      price: 79999,
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '6.8" Dynamic AMOLED 2X',
        'İşlemci': 'Snapdragon 8 Gen 3',
        'RAM': '12GB',
        'Depolama': '512GB',
        'Kamera': '200MP Ana + 12MP Ultra Geniş + 50MP Telefoto + 10MP Telefoto',
        'Pil': '5000mAh',
        'İşletim Sistemi': 'Android 14, One UI 6.1',
        'S Pen': 'Dahil',
        'Su Geçirmezlik': 'IP68'
      },
      tags: ['Samsung', 'Galaxy', 'S Pen', '5G', 'Ultra', 'Android'],
      variants: [
        { color: 'Titanium Black', size: '512GB', stock: 25, price: 79999 },
        { color: 'Titanium Gray', size: '512GB', stock: 20, price: 79999 }
      ],
      isFeatured: true
    },
    {
      name: 'MacBook Pro 16" M3',
      description: 'Apple MacBook Pro 16" M3 Pro chip, 18GB RAM, 512GB SSD',
      price: 129999,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '16.2" Liquid Retina XDR',
        'İşlemci': 'Apple M3 Pro chip',
        'RAM': '18GB Unified Memory',
        'Depolama': '512GB SSD',
        'Grafik': '18-core GPU',
        'Kamera': '1080p FaceTime HD',
        'Bağlantı': 'Wi-Fi 6E, Bluetooth 5.3',
        'Pil': '22 saat kullanım'
      },
      tags: ['MacBook', 'Apple', 'M3', 'Pro', 'Laptop', 'Creative'],
      variants: [
        { color: 'Space Gray', size: '512GB', stock: 15, price: 129999 },
        { color: 'Silver', size: '512GB', stock: 10, price: 129999 }
      ],
      isFeatured: true
    },
    {
      name: 'Dell XPS 15 Laptop',
      description: 'Dell XPS 15 15.6" 4K OLED, Intel i9, 32GB RAM, 1TB SSD',
      price: 89999,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '15.6" 4K OLED Touch',
        'İşlemci': 'Intel Core i9-13900H',
        'RAM': '32GB DDR5',
        'Depolama': '1TB PCIe SSD',
        'Grafik': 'NVIDIA RTX 4070 8GB',
        'Kamera': '720p HD',
        'Bağlantı': 'Wi-Fi 6E, Bluetooth 5.2',
        'Pil': '86Whr'
      },
      tags: ['Dell', 'XPS', 'Intel', '4K', 'OLED', 'Gaming'],
      variants: [
        { color: 'Platinum Silver', size: '1TB', stock: 20, price: 89999 },
        { color: 'Frost White', size: '1TB', stock: 10, price: 89999 }
      ],
      isFeatured: false
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Sony WH-1000XM5 Kablosuz Gürültü Önleyici Kulaklık',
      price: 12999,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      specifications: {
        'Gürültü Engelleme': '30dB',
        'Pil Ömrü': '30 saat (NC açık)',
        'Şarj Süresi': '3 saat',
        'Bağlantı': 'Bluetooth 5.2, NFC',
        'Kodek': 'LDAC, AAC, SBC',
        'Mikrofon': '8 mikrofon',
        'Ağırlık': '250g',
        'Garanti': '2 yıl'
      },
      tags: ['Sony', 'Kulaklık', 'Gürültü Engelleme', 'Bluetooth', 'Premium'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 60, price: 12999 },
        { color: 'Gümüş', size: 'Standart', stock: 40, price: 12999 }
      ],
      isFeatured: true
    },
    {
      name: 'AirPods Pro 2',
      description: 'Apple AirPods Pro 2. Nesil Aktif Gürültü Engelleme',
      price: 8999,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=600&fit=crop',
      specifications: {
        'Gürültü Engelleme': 'Adaptive Transparency',
        'Pil Ömrü': '6 saat (NC açık)',
        'Şarj Kutusu': '30 saat toplam',
        'Bağlantı': 'Bluetooth 5.3, H2 chip',
        'Su Geçirmezlik': 'IPX4',
        'Mikrofon': 'Voice Pickup',
        'Ağırlık': '5.3g (her kulaklık)',
        'Garanti': '1 yıl'
      },
      tags: ['Apple', 'AirPods', 'Pro', 'Gürültü Engelleme', 'Bluetooth'],
      variants: [
        { color: 'Beyaz', size: 'Standart', stock: 100, price: 8999 },
        { color: 'Beyaz', size: 'USB-C', stock: 50, price: 9999 }
      ],
      isFeatured: true
    },
    {
      name: 'iPad Pro 12.9" M2',
      description: 'Apple iPad Pro 12.9" M2 chip, 256GB, Wi-Fi + Cellular',
      price: 49999,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '12.9" Liquid Retina XDR',
        'İşlemci': 'Apple M2 chip',
        'RAM': '8GB',
        'Depolama': '256GB',
        'Kamera': '12MP Ultra Wide + 10MP Wide',
        'Pil': '10 saat kullanım',
        'Bağlantı': 'Wi-Fi 6E, 5G',
        'Apple Pencil': '2. Nesil uyumlu'
      },
      tags: ['iPad', 'Apple', 'M2', 'Pro', 'Tablet', 'Creative'],
      variants: [
        { color: 'Space Gray', size: '256GB Wi-Fi', stock: 25, price: 49999 },
        { color: 'Silver', size: '256GB Cellular', stock: 15, price: 59999 }
      ],
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy Tab S9 Ultra',
      description: 'Samsung Galaxy Tab S9 Ultra 14.6" 256GB, S Pen dahil',
      price: 39999,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '14.6" Dynamic AMOLED 2X',
        'İşlemci': 'Snapdragon 8 Gen 2',
        'RAM': '12GB',
        'Depolama': '256GB',
        'Kamera': '13MP + 8MP Ultra Wide',
        'Pil': '11200mAh',
        'S Pen': 'Dahil',
        'İşletim Sistemi': 'Android 13, One UI 5.1'
      },
      tags: ['Samsung', 'Galaxy Tab', 'S Pen', 'Android', 'Tablet', 'Ultra'],
      variants: [
        { color: 'Mystic Black', size: '256GB Wi-Fi', stock: 20, price: 39999 },
        { color: 'Mystic Silver', size: '256GB Cellular', stock: 15, price: 49999 }
      ],
      isFeatured: false
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Apple Watch Series 9 45mm GPS + Cellular, Always-On Retina',
      price: 19999,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '45mm Always-On Retina',
        'İşlemci': 'S9 SiP',
        'Depolama': '64GB',
        'Sensörler': 'Kalp atış hızı, ECG, Oksijen',
        'Su Geçirmezlik': 'WR50, IP6X',
        'Pil': '18 saat kullanım',
        'Bağlantı': 'GPS, Cellular, Wi-Fi',
        'İşletim Sistemi': 'watchOS 10'
      },
      tags: ['Apple Watch', 'Series 9', 'GPS', 'Cellular', 'Fitness', 'Health'],
      variants: [
        { color: 'Midnight', size: '45mm GPS', stock: 50, price: 19999 },
        { color: 'Starlight', size: '45mm Cellular', stock: 30, price: 24999 }
      ],
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy Watch 6',
      description: 'Samsung Galaxy Watch 6 Classic 47mm, Wear OS',
      price: 15999,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '47mm Super AMOLED',
        'İşlemci': 'Exynos W930',
        'RAM': '2GB',
        'Depolama': '16GB',
        'Sensörler': 'Kalp atış hızı, ECG, Kan oksijeni',
        'Su Geçirmezlik': '5ATM, IP68',
        'Pil': '40 saat kullanım',
        'İşletim Sistemi': 'Wear OS 4'
      },
      tags: ['Samsung', 'Galaxy Watch', 'Wear OS', 'Fitness', 'Health', 'Classic'],
      variants: [
        { color: 'Black', size: '47mm', stock: 35, price: 15999 },
        { color: 'Silver', size: '47mm', stock: 25, price: 15999 }
      ],
      isFeatured: false
    }
  ],
  'Clothing': [
    {
      name: 'Nike Air Max 270',
      description: 'Nike Air Max 270 Erkek Spor Ayakkabı, Rahat ve Şık',
      price: 2499,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
      specifications: {
        'Üst Malzeme': 'Mesh ve Sentetik',
        'Taban': 'Air Max 270 ünitesi',
        'Taban Yüksekliği': '32mm',
        'Ağırlık': '320g',
        'Cinsiyet': 'Erkek',
        'Kullanım': 'Günlük, Spor',
        'Garanti': '2 yıl',
        'Menşei': 'Vietnam'
      },
      tags: ['Nike', 'Air Max', 'Spor Ayakkabı', 'Erkek', 'Günlük'],
      variants: [
        { color: 'Siyah/Beyaz', size: '42', stock: 40, price: 2499 },
        { color: 'Beyaz/Gri', size: '43', stock: 35, price: 2499 },
        { color: 'Mavi/Beyaz', size: '44', stock: 30, price: 2499 }
      ],
      isFeatured: true
    },
    {
      name: 'Adidas Ultraboost 22',
      description: 'Adidas Ultraboost 22 Kadın Koşu Ayakkabısı, Hafif ve Esnek',
      price: 2999,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop',
      specifications: {
        'Üst Malzeme': 'Primeknit+',
        'Taban': 'Boost midsole',
        'Taban Yüksekliği': '10mm drop',
        'Ağırlık': '280g',
        'Cinsiyet': 'Kadın',
        'Kullanım': 'Koşu, Günlük',
        'Garanti': '2 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Adidas', 'Ultraboost', 'Koşu', 'Kadın', 'Boost'],
      variants: [
        { color: 'Beyaz/Pembe', size: '38', stock: 30, price: 2999 },
        { color: 'Siyah/Gri', size: '39', stock: 25, price: 2999 },
        { color: 'Mavi/Beyaz', size: '40', stock: 20, price: 2999 }
      ],
      isFeatured: true
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      description: 'Levi\'s 501 Original Erkek Kot Pantolon, Klasik Kesim',
      price: 899,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Pamuk Denim',
        'Kesim': 'Straight Fit',
        'Yıkama': 'Medium Stone Wash',
        'Cinsiyet': 'Erkek',
        'Kullanım': 'Günlük, Klasik',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Levi\'s', '501', 'Denim', 'Erkek', 'Klasik'],
      variants: [
        { color: 'Mavi', size: '30/32', stock: 50, price: 899 },
        { color: 'Mavi', size: '32/32', stock: 45, price: 899 },
        { color: 'Mavi', size: '34/32', stock: 40, price: 899 }
      ],
      isFeatured: false
    },
    {
      name: 'Zara Basic T-Shirt',
      description: 'Zara Basic Pamuklu T-Shirt, Günlük Kullanım İçin',
      price: 299,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Pamuk',
        'Kesim': 'Regular Fit',
        'Yaka': 'Yuvarlak Yaka',
        'Cinsiyet': 'Unisex',
        'Kullanım': 'Günlük, Basic',
        'Garanti': '6 ay',
        'Menşei': 'Türkiye'
      },
      tags: ['Zara', 'Basic', 'T-Shirt', 'Pamuk', 'Günlük'],
      variants: [
        { color: 'Beyaz', size: 'S', stock: 100, price: 299 },
        { color: 'Beyaz', size: 'M', stock: 120, price: 299 },
        { color: 'Siyah', size: 'L', stock: 80, price: 299 }
      ],
      isFeatured: false
    },
    {
      name: 'H&M Oversized Sweater',
      description: 'H&M Oversized Yün Kazak, Rahat ve Şık Tasarım',
      price: 599,
      stock: 250,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%50 Yün, %50 Akrilik',
        'Kesim': 'Oversized',
        'Yaka': 'Yuvarlak Yaka',
        'Cinsiyet': 'Unisex',
        'Kullanım': 'Günlük, Rahat',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['H&M', 'Oversized', 'Kazak', 'Yün', 'Rahat'],
      variants: [
        { color: 'Bej', size: 'M', stock: 60, price: 599 },
        { color: 'Gri', size: 'L', stock: 50, price: 599 },
        { color: 'Siyah', size: 'XL', stock: 40, price: 599 }
      ],
      isFeatured: true
    },
    {
      name: 'Uniqlo Lightweight Jacket',
      description: 'Uniqlo Hafif Mont, Su Geçirmez Teknoloji',
      price: 1299,
      stock: 180,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Nylon, Polyester',
        'Su Geçirmezlik': 'DWR Kaplama',
        'Kesim': 'Regular Fit',
        'Cinsiyet': 'Unisex',
        'Kullanım': 'Günlük, Outdoor',
        'Garanti': '1 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Uniqlo', 'Mont', 'Su Geçirmez', 'Hafif', 'Outdoor'],
      variants: [
        { color: 'Siyah', size: 'M', stock: 45, price: 1299 },
        { color: 'Mavi', size: 'L', stock: 40, price: 1299 },
        { color: 'Gri', size: 'XL', stock: 35, price: 1299 }
      ],
      isFeatured: false
    },
    {
      name: 'Mango Summer Dress',
      description: 'Mango Yaz Elbisesi, Çiçekli Desen, Rahat Kesim',
      price: 799,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Viskon',
        'Desen': 'Çiçekli',
        'Kesim': 'A-Line',
        'Cinsiyet': 'Kadın',
        'Kullanım': 'Yaz, Günlük',
        'Garanti': '6 ay',
        'Menşei': 'Türkiye'
      },
      tags: ['Mango', 'Elbise', 'Yaz', 'Çiçekli', 'Kadın'],
      variants: [
        { color: 'Çiçekli', size: 'S', stock: 30, price: 799 },
        { color: 'Çiçekli', size: 'M', stock: 35, price: 799 },
        { color: 'Çiçekli', size: 'L', stock: 25, price: 799 }
      ],
      isFeatured: true
    },
    {
      name: 'Pull&Bear Denim Jacket',
      description: 'Pull&Bear Denim Ceket, Vintage Görünüm',
      price: 999,
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Pamuk Denim',
        'Stil': 'Vintage',
        'Kesim': 'Regular Fit',
        'Cinsiyet': 'Unisex',
        'Kullanım': 'Günlük, Vintage',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Pull&Bear', 'Denim', 'Ceket', 'Vintage', 'Unisex'],
      variants: [
        { color: 'Mavi', size: 'S', stock: 25, price: 999 },
        { color: 'Mavi', size: 'M', stock: 30, price: 999 },
        { color: 'Mavi', size: 'L', stock: 20, price: 999 }
      ],
      isFeatured: false
    },
    {
      name: 'Bershka Cargo Pants',
      description: 'Bershka Cargo Pantolon, Çok Cep Detayı',
      price: 699,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa117b8f958d?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Pamuk',
        'Kesim': 'Relaxed Fit',
        'Cep Detayı': '6 Cep',
        'Cinsiyet': 'Unisex',
        'Kullanım': 'Günlük, Rahat',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Bershka', 'Cargo', 'Pantolon', 'Rahat', 'Günlük'],
      variants: [
        { color: 'Bej', size: 'M', stock: 50, price: 699 },
        { color: 'Bej', size: 'L', stock: 45, price: 699 },
        { color: 'Siyah', size: 'XL', stock: 40, price: 699 }
      ],
      isFeatured: false
    },
    {
      name: 'Stradivarius Blouse',
      description: 'Stradivarius Bluz, Zarif Detaylar, Ofis Uyumlu',
      price: 449,
      stock: 160,
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': '%100 Polyester',
        'Kesim': 'Regular Fit',
        'Yaka': 'V Yaka',
        'Cinsiyet': 'Kadın',
        'Kullanım': 'Ofis, Günlük',
        'Garanti': '6 ay',
        'Menşei': 'Türkiye'
      },
      tags: ['Stradivarius', 'Bluz', 'Ofis', 'Kadın', 'Zarif'],
      variants: [
        { color: 'Beyaz', size: 'S', stock: 40, price: 449 },
        { color: 'Beyaz', size: 'M', stock: 45, price: 449 },
        { color: 'Mavi', size: 'L', stock: 35, price: 449 }
      ],
      isFeatured: false
    }
  ],
  'Home and Garden': [
    {
      name: 'IKEA MALM Bed Frame',
      description: 'IKEA MALM Yatak Çerçevesi, Beyaz, 160x200cm',
      price: 2999,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Çam Ağacı, MDF',
        'Boyut': '160x200cm',
        'Renk': 'Beyaz',
        'Stil': 'Minimalist',
        'Kullanım': 'Yatak Odası',
        'Garanti': '10 yıl',
        'Menşei': 'Polonya'
      },
      tags: ['IKEA', 'MALM', 'Yatak', 'Minimalist', 'Beyaz'],
      variants: [
        { color: 'Beyaz', size: '160x200cm', stock: 30, price: 2999 },
        { color: 'Beyaz', size: '180x200cm', stock: 20, price: 3499 }
      ],
      isFeatured: true
    },
    {
      name: 'Philips Hue Smart Bulb',
      description: 'Philips Hue Akıllı Ampul, 16 Milyon Renk, Wi-Fi Kontrol',
      price: 899,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop',
      specifications: {
        'Güç': '9W (60W eşdeğeri)',
        'Renk': '16 Milyon Renk',
        'Bağlantı': 'Wi-Fi, Bluetooth',
        'Uygulama': 'Philips Hue App',
        'Kullanım': 'İç Mekan',
        'Garanti': '3 yıl',
        'Menşei': 'Hollanda'
      },
      tags: ['Philips', 'Hue', 'Akıllı', 'Ampul', 'Wi-Fi'],
      variants: [
        { color: 'Beyaz', size: 'E27', stock: 120, price: 899 },
        { color: 'Beyaz', size: 'E14', stock: 80, price: 899 }
      ],
      isFeatured: true
    },
    {
      name: 'KitchenAid Stand Mixer',
      description: 'KitchenAid Profesyonel Mikser, 5.5L, 10 Hız',
      price: 8999,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      specifications: {
        'Kapasite': '5.5L Kase',
        'Güç': '300W Motor',
        'Hız': '10 Hız Ayarı',
        'Malzeme': 'Metal Gövde',
        'Kullanım': 'Profesyonel',
        'Garanti': '5 yıl',
        'Menşei': 'ABD'
      },
      tags: ['KitchenAid', 'Mikser', 'Profesyonel', 'Mutfak', 'Metal'],
      variants: [
        { color: 'Empire Red', size: '5.5L', stock: 15, price: 8999 },
        { color: 'Black', size: '5.5L', stock: 10, price: 8999 },
        { color: 'Silver', size: '5.5L', stock: 5, price: 8999 }
      ],
      isFeatured: true
    },
    {
      name: 'Dyson V15 Detect',
      description: 'Dyson V15 Detect Absolute Extra Kablosuz Süpürge',
      price: 15999,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      specifications: {
        'Güç': '240AW Emiş Gücü',
        'Pil': '60 dakika kullanım',
        'Teknoloji': 'Laser Slim Fluffy',
        'Filtre': 'HEPA Filtre',
        'Kullanım': 'Kablosuz',
        'Garanti': '2 yıl',
        'Menşei': 'Malezya'
      },
      tags: ['Dyson', 'Süpürge', 'Kablosuz', 'Laser', 'HEPA'],
      variants: [
        { color: 'Nickel/Copper', size: 'Standart', stock: 15, price: 15999 },
        { color: 'Gold', size: 'Standart', stock: 10, price: 15999 }
      ],
      isFeatured: true
    },
    {
      name: 'Bosch Dishwasher',
      description: 'Bosch 60cm Bulaşık Makinesi, 12 Kişilik, A+++',
      price: 12999,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      specifications: {
        'Kapasite': '12 Kişilik',
        'Enerji Sınıfı': 'A+++',
        'Boyut': '60cm Genişlik',
        'Program': '6 Program',
        'Gürültü': '44dB',
        'Kullanım': 'Gömme',
        'Garanti': '2 yıl',
        'Menşei': 'Almanya'
      },
      tags: ['Bosch', 'Bulaşık Makinesi', 'A+++', 'Gömme', 'Alman'],
      variants: [
        { color: 'Beyaz', size: '60cm', stock: 25, price: 12999 },
        { color: 'Inox', size: '60cm', stock: 15, price: 14999 }
      ],
      isFeatured: false
    },
    {
      name: 'Samsung Smart TV 65"',
      description: 'Samsung 65" 4K Smart TV, Crystal Display',
      price: 24999,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '65" 4K UHD',
        'Çözünürlük': '3840x2160',
        'İşletim Sistemi': 'Tizen OS',
        'HDR': 'HDR10+',
        'Bağlantı': 'Wi-Fi, Bluetooth',
        'Kullanım': 'Smart TV',
        'Garanti': '2 yıl',
        'Menşei': 'Güney Kore'
      },
      tags: ['Samsung', 'Smart TV', '4K', '65"', 'Crystal'],
      variants: [
        { color: 'Siyah', size: '65"', stock: 12, price: 24999 },
        { color: 'Gri', size: '65"', stock: 8, price: 24999 }
      ],
      isFeatured: true
    },
    {
      name: 'Garden Tools Set',
      description: 'Bahçe Aletleri Seti, 12 Parça, Profesyonel Kalite',
      price: 1299,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      specifications: {
        'Parça Sayısı': '12 Parça',
        'Malzeme': 'Paslanmaz Çelik',
        'Sap': 'Ahşap',
        'Kullanım': 'Bahçe, Profesyonel',
        'Kutu': 'Dahil',
        'Garanti': '5 yıl',
        'Menşei': 'Almanya'
      },
      tags: ['Bahçe', 'Alet', 'Set', 'Profesyonel', 'Çelik'],
      variants: [
        { color: 'Çelik', size: '12 Parça', stock: 60, price: 1299 },
        { color: 'Çelik', size: '8 Parça', stock: 40, price: 899 }
      ],
      isFeatured: false
    },
    {
      name: 'Outdoor Furniture Set',
      description: 'Bahçe Mobilya Seti, 6 Kişilik, Dayanıklı Malzeme',
      price: 5999,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      specifications: {
        'Kapasite': '6 Kişilik',
        'Malzeme': 'Alüminyum, Tekstil',
        'Renk': 'Kahverengi',
        'Kullanım': 'Bahçe, Balkon',
        'Su Geçirmezlik': 'Evet',
        'Garanti': '3 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Bahçe', 'Mobilya', 'Set', '6 Kişilik', 'Alüminyum'],
      variants: [
        { color: 'Kahverengi', size: '6 Kişilik', stock: 10, price: 5999 },
        { color: 'Gri', size: '4 Kişilik', stock: 5, price: 3999 }
      ],
      isFeatured: true
    },
    {
      name: 'Plant Pots Collection',
      description: 'Saksı Koleksiyonu, 5 Farklı Boyut, Seramik',
      price: 599,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d244d1ea?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Seramik',
        'Parça Sayısı': '5 Adet',
        'Boyutlar': '10cm, 15cm, 20cm, 25cm, 30cm',
        'Renk': 'Beyaz',
        'Drenaj': 'Dahil',
        'Kullanım': 'İç Mekan',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Saksı', 'Seramik', 'Koleksiyon', '5 Adet', 'Beyaz'],
      variants: [
        { color: 'Beyaz', size: '5 Adet', stock: 120, price: 599 },
        { color: 'Kahverengi', size: '3 Adet', stock: 80, price: 399 }
      ],
      isFeatured: false
    },
    {
      name: 'LED Garden Lights',
      description: 'Bahçe LED Aydınlatma Seti, 10 Adet, Solar Enerji',
      price: 899,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop',
      specifications: {
        'Parça Sayısı': '10 Adet',
        'Güç': 'Solar LED',
        'Renk': 'Beyaz',
        'Çalışma Süresi': '8-10 saat',
        'Su Geçirmezlik': 'IP65',
        'Kullanım': 'Bahçe, Dış Mekan',
        'Garanti': '2 yıl',
        'Menşei': 'Çin'
      },
      tags: ['LED', 'Bahçe', 'Solar', 'Aydınlatma', '10 Adet'],
      variants: [
        { color: 'Beyaz', size: '10 Adet', stock: 50, price: 899 },
        { color: 'Renkli', size: '8 Adet', stock: 30, price: 699 }
      ],
      isFeatured: false
    }
  ],
  'Sports': [
    {
      name: 'Nike Basketball',
      description: 'Nike Resmi Basketbol Topu, NBA Onaylı, 7 Numaralı',
      price: 299,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
      specifications: {
        'Boyut': '7 Numaralı',
        'Malzeme': 'Sentetik Deri',
        'Onay': 'NBA Resmi',
        'Ağırlık': '600g',
        'Kullanım': 'Profesyonel',
        'Garanti': '1 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Nike', 'Basketbol', 'NBA', '7 Numaralı', 'Profesyonel'],
      variants: [
        { color: 'Turuncu', size: '7 Numaralı', stock: 80, price: 299 },
        { color: 'Kahverengi', size: '6 Numaralı', stock: 70, price: 249 }
      ],
      isFeatured: true
    },
    {
      name: 'Adidas Football Boots',
      description: 'Adidas Predator Futbol Ayakkabısı, Çim Sahalar İçin',
      price: 1999,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Sentetik Deri',
        'Taban': 'FG (Firm Ground)',
        'Ağırlık': '250g',
        'Kullanım': 'Çim Sahalar',
        'Garanti': '1 yıl',
        'Menşei': 'Vietnam'
      },
      tags: ['Adidas', 'Predator', 'Futbol', 'Çim', 'FG'],
      variants: [
        { color: 'Siyah/Kırmızı', size: '42', stock: 30, price: 1999 },
        { color: 'Beyaz/Mavi', size: '43', stock: 25, price: 1999 }
      ],
      isFeatured: true
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Premium Yoga Matı, 6mm Kalınlık, Anti-Kayma',
      price: 399,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
      specifications: {
        'Kalınlık': '6mm',
        'Malzeme': 'PVC',
        'Boyut': '183x61cm',
        'Özellik': 'Anti-Kayma',
        'Kullanım': 'Yoga, Pilates',
        'Garanti': '1 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Yoga', 'Mat', 'Premium', 'Anti-Kayma', '6mm'],
      variants: [
        { color: 'Mor', size: 'Standart', stock: 100, price: 399 },
        { color: 'Mavi', size: 'Standart', stock: 100, price: 399 }
      ],
      isFeatured: false
    },
    {
      name: 'Dumbbell Set',
      description: 'Dambıl Seti, 2-20kg, Profesyonel Kalite',
      price: 2999,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '2-20kg (8 çift)',
        'Malzeme': 'Çelik',
        'Kaplama': 'Kauçuk',
        'Kullanım': 'Fitness, Ev',
        'Garanti': '5 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Dambıl', 'Set', 'Fitness', 'Çelik', 'Profesyonel'],
      variants: [
        { color: 'Siyah', size: '2-20kg', stock: 30, price: 2999 },
        { color: 'Gri', size: '5-15kg', stock: 20, price: 1999 }
      ],
      isFeatured: true
    },
    {
      name: 'Treadmill Pro',
      description: 'Profesyonel Koşu Bandı, 3HP Motor, 12 Program',
      price: 15999,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      specifications: {
        'Motor': '3HP DC',
        'Hız': '1-16 km/saat',
        'Program': '12 Program',
        'Ekran': 'LCD 7"',
        'Maksimum Ağırlık': '150kg',
        'Garanti': '2 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Koşu Bandı', 'Profesyonel', '3HP', 'LCD', 'Fitness'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 10, price: 15999 },
        { color: 'Gri', size: 'Premium', stock: 5, price: 18999 }
      ],
      isFeatured: true
    },
    {
      name: 'Bicycle Mountain',
      description: 'Dağ Bisikleti, 21 Vites, Alüminyum Çerçeve',
      price: 8999,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop',
      specifications: {
        'Çerçeve': 'Alüminyum 6061',
        'Vites': '21 Vites',
        'Fren': 'Disk Fren',
        'Boyut': '26" Tekerlek',
        'Kullanım': 'Dağ, Şehir',
        'Garanti': '2 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Bisiklet', 'Dağ', '21 Vites', 'Alüminyum', 'Disk Fren'],
      variants: [
        { color: 'Kırmızı', size: 'M', stock: 15, price: 8999 },
        { color: 'Mavi', size: 'L', stock: 10, price: 8999 }
      ],
      isFeatured: true
    },
    {
      name: 'Tennis Racket Pro',
      description: 'Profesyonel Tenis Raketi, Karbon Fiber, 300g',
      price: 2499,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Karbon Fiber',
        'Ağırlık': '300g',
        'Boyut': '100 inç²',
        'Kullanım': 'Profesyonel',
        'Garanti': '1 yıl',
        'Menşei': 'Tayvan'
      },
      tags: ['Tenis', 'Raket', 'Karbon Fiber', 'Profesyonel', '300g'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 35, price: 2499 },
        { color: 'Beyaz', size: 'Standart', stock: 25, price: 2499 }
      ],
      isFeatured: false
    },
    {
      name: 'Swimming Goggles',
      description: 'Yüzme Gözlüğü, Anti-Fog Teknolojisi, UV Korumalı',
      price: 199,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop',
      specifications: {
        'Teknoloji': 'Anti-Fog',
        'Koruma': 'UV Korumalı',
        'Malzeme': 'Silicone',
        'Kullanım': 'Yüzme, Profesyonel',
        'Garanti': '6 ay',
        'Menşei': 'Çin'
      },
      tags: ['Yüzme', 'Gözlük', 'Anti-Fog', 'UV', 'Silicone'],
      variants: [
        { color: 'Şeffaf', size: 'Standart', stock: 150, price: 199 },
        { color: 'Mavi', size: 'Standart', stock: 150, price: 199 }
      ],
      isFeatured: false
    },
    {
      name: 'Fitness Tracker',
      description: 'Akıllı Fitness Takip Cihazı, Kalp Atış Hızı, GPS',
      price: 1499,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '1.4" AMOLED',
        'Sensörler': 'Kalp Atış Hızı, GPS',
        'Pil': '7 gün kullanım',
        'Su Geçirmezlik': '5ATM',
        'Bağlantı': 'Bluetooth 5.0',
        'Garanti': '1 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Fitness', 'Takip', 'GPS', 'Kalp Atış', 'Bluetooth'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 60, price: 1499 },
        { color: 'Mavi', size: 'Standart', stock: 40, price: 1499 }
      ],
      isFeatured: true
    },
    {
      name: 'Resistance Bands',
      description: 'Direnç Bandı Seti, 5 Farklı Seviye, Lateks',
      price: 299,
      stock: 250,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      specifications: {
        'Malzeme': 'Lateks',
        'Seviye': '5 Farklı Seviye',
        'Renk': '5 Farklı Renk',
        'Kullanım': 'Fitness, Ev',
        'Garanti': '1 yıl',
        'Menşei': 'Çin'
      },
      tags: ['Direnç Bandı', 'Lateks', '5 Seviye', 'Fitness', 'Ev'],
      variants: [
        { color: '5 Renk', size: '5 Seviye', stock: 150, price: 299 },
        { color: '3 Renk', size: '3 Seviye', stock: 100, price: 199 }
      ],
      isFeatured: false
    }
  ],
  'Books': [
    {
      name: 'The Alchemist',
      description: 'Paulo Coelho - Simyacı, Türkçe Çeviri, Ciltli',
      price: 89,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Paulo Coelho',
        'Çeviri': 'Türkçe',
        'Sayfa': '184 Sayfa',
        'Cilt': 'Ciltli',
        'Kategori': 'Roman',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Paulo Coelho', 'Simyacı', 'Roman', 'Ciltli', 'Türkçe'],
      variants: [
        { color: 'Kahverengi', size: 'Ciltli', stock: 300, price: 89 },
        { color: 'Kahverengi', size: 'Karton', stock: 200, price: 69 }
      ],
      isFeatured: true
    },
    {
      name: '1984 - George Orwell',
      description: 'George Orwell - 1984, Distopik Roman, Klasik',
      price: 79,
      stock: 400,
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'George Orwell',
        'Çeviri': 'Türkçe',
        'Sayfa': '328 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Distopik Roman',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['George Orwell', '1984', 'Distopik', 'Roman', 'Klasik'],
      variants: [
        { color: 'Kırmızı', size: 'Karton', stock: 250, price: 79 },
        { color: 'Kırmızı', size: 'Ciltli', stock: 150, price: 99 }
      ],
      isFeatured: true
    },
    {
      name: 'Harry Potter Set',
      description: 'J.K. Rowling - Harry Potter Tam Set, 7 Kitap',
      price: 599,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'J.K. Rowling',
        'Çeviri': 'Türkçe',
        'Sayfa': '3500+ Sayfa',
        'Cilt': 'Ciltli Set',
        'Kategori': 'Fantastik Roman',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Harry Potter', 'J.K. Rowling', 'Fantastik', 'Set', '7 Kitap'],
      variants: [
        { color: 'Kahverengi', size: '7 Kitap', stock: 60, price: 599 },
        { color: 'Siyah', size: '7 Kitap', stock: 40, price: 599 }
      ],
      isFeatured: true
    },
    {
      name: 'The Lord of the Rings',
      description: 'J.R.R. Tolkien - Yüzüklerin Efendisi, 3 Cilt',
      price: 299,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'J.R.R. Tolkien',
        'Çeviri': 'Türkçe',
        'Sayfa': '1200+ Sayfa',
        'Cilt': '3 Cilt Set',
        'Kategori': 'Fantastik Roman',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Tolkien', 'Yüzüklerin Efendisi', 'Fantastik', '3 Cilt', 'Klasik'],
      variants: [
        { color: 'Kahverengi', size: '3 Cilt', stock: 100, price: 299 },
        { color: 'Siyah', size: '3 Cilt', stock: 50, price: 299 }
      ],
      isFeatured: true
    },
    {
      name: 'Rich Dad Poor Dad',
      description: 'Robert Kiyosaki - Zengin Baba Yoksul Baba',
      price: 99,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Robert Kiyosaki',
        'Çeviri': 'Türkçe',
        'Sayfa': '336 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Kişisel Gelişim',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Robert Kiyosaki', 'Zengin Baba', 'Kişisel Gelişim', 'Finans'],
      variants: [
        { color: 'Mavi', size: 'Karton', stock: 200, price: 99 },
        { color: 'Mavi', size: 'Ciltli', stock: 100, price: 129 }
      ],
      isFeatured: true
    },
    {
      name: 'Think and Grow Rich',
      description: 'Napoleon Hill - Düşün ve Zengin Ol',
      price: 89,
      stock: 250,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Napoleon Hill',
        'Çeviri': 'Türkçe',
        'Sayfa': '320 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Kişisel Gelişim',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Napoleon Hill', 'Düşün ve Zengin Ol', 'Kişisel Gelişim', 'Klasik'],
      variants: [
        { color: 'Altın', size: 'Karton', stock: 150, price: 89 },
        { color: 'Altın', size: 'Ciltli', stock: 100, price: 119 }
      ],
      isFeatured: true
    },
    {
      name: 'The Psychology of Money',
      description: 'Morgan Housel - Paranın Psikolojisi',
      price: 119,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Morgan Housel',
        'Çeviri': 'Türkçe',
        'Sayfa': '256 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Finans',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Morgan Housel', 'Paranın Psikolojisi', 'Finans', 'Psikoloji'],
      variants: [
        { color: 'Yeşil', size: 'Karton', stock: 120, price: 119 },
        { color: 'Yeşil', size: 'Ciltli', stock: 80, price: 149 }
      ],
      isFeatured: true
    },
    {
      name: 'Atomic Habits',
      description: 'James Clear - Atomik Alışkanlıklar',
      price: 129,
      stock: 350,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'James Clear',
        'Çeviri': 'Türkçe',
        'Sayfa': '320 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Kişisel Gelişim',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['James Clear', 'Atomik Alışkanlıklar', 'Kişisel Gelişim', 'Alışkanlık'],
      variants: [
        { color: 'Mavi', size: 'Karton', stock: 200, price: 129 },
        { color: 'Mavi', size: 'Ciltli', stock: 150, price: 159 }
      ],
      isFeatured: true
    },
    {
      name: 'The Subtle Art of Not Giving a F*ck',
      description: 'Mark Manson - Umursamamanın İnce Sanatı',
      price: 109,
      stock: 180,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Mark Manson',
        'Çeviri': 'Türkçe',
        'Sayfa': '224 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Kişisel Gelişim',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Mark Manson', 'Umursamamanın İnce Sanatı', 'Kişisel Gelişim', 'Psikoloji'],
      variants: [
        { color: 'Siyah', size: 'Karton', stock: 100, price: 109 },
        { color: 'Siyah', size: 'Ciltli', stock: 80, price: 139 }
      ],
      isFeatured: true
    },
    {
      name: 'Ikigai: The Japanese Secret',
      description: 'Hector Garcia - Ikigai: Japonların Uzun Yaşam Sırrı',
      price: 99,
      stock: 220,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      specifications: {
        'Yazar': 'Hector Garcia',
        'Çeviri': 'Türkçe',
        'Sayfa': '208 Sayfa',
        'Cilt': 'Karton',
        'Kategori': 'Kişisel Gelişim',
        'Garanti': '1 yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Hector Garcia', 'Ikigai', 'Japon', 'Uzun Yaşam', 'Kişisel Gelişim'],
      variants: [
        { color: 'Kırmızı', size: 'Karton', stock: 120, price: 99 },
        { color: 'Kırmızı', size: 'Ciltli', stock: 100, price: 129 }
      ],
      isFeatured: true
    }
  ],
  'Health and Beauty': [
    {
      name: 'La Roche Posay Effaclar',
      description: 'La Roche Posay Effaclar Duo+ Akne Karşıtı Krem',
      price: 299,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '40ml',
        'Tip': 'Akne Karşıtı',
        'Cilt Tipi': 'Yağlı, Karma',
        'Aktif Bileşen': 'Niacinamide, Salicylic Acid',
        'Kullanım': 'Günde 2 kez',
        'Garanti': '1 yıl',
        'Menşei': 'Fransa'
      },
      tags: ['La Roche Posay', 'Effaclar', 'Akne', 'Krem', 'Cilt Bakımı'],
      variants: [
        { color: 'Beyaz', size: '40ml', stock: 120, price: 299 },
        { color: 'Beyaz', size: '80ml', stock: 80, price: 499 }
      ],
      isFeatured: true
    },
    {
      name: 'The Ordinary Niacinamide',
      description: 'The Ordinary Niacinamide 10% + Zinc 1% Serum',
      price: 199,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '30ml',
        'Tip': 'Serum',
        'Aktif Bileşen': 'Niacinamide 10%, Zinc 1%',
        'Cilt Tipi': 'Tüm Cilt Tipleri',
        'Kullanım': 'Günde 1-2 kez',
        'Garanti': '1 yıl',
        'Menşei': 'Kanada'
      },
      tags: ['The Ordinary', 'Niacinamide', 'Serum', 'Cilt Bakımı', '10%'],
      variants: [
        { color: 'Şeffaf', size: '30ml', stock: 180, price: 199 },
        { color: 'Şeffaf', size: '60ml', stock: 120, price: 299 }
      ],
      isFeatured: true
    },
    {
      name: 'Philips Sonicare Toothbrush',
      description: 'Philips Sonicare DiamondClean Akıllı Diş Fırçası',
      price: 1999,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1559591935-c7c65d8c7633?w=800&h=600&fit=crop',
      specifications: {
        'Teknoloji': 'Sonic',
        'Pil': '3 hafta kullanım',
        'Mod': '5 Farklı Mod',
        'Bağlantı': 'Bluetooth',
        'Kullanım': 'Ağız Hijyeni',
        'Garanti': '2 yıl',
        'Menşei': 'Hollanda'
      },
      tags: ['Philips', 'Sonicare', 'Diş Fırçası', 'Akıllı', 'Bluetooth'],
      variants: [
        { color: 'Pembe', size: 'Standart', stock: 60, price: 1999 },
        { color: 'Mavi', size: 'Standart', stock: 40, price: 1999 }
      ],
      isFeatured: true
    },
    {
      name: 'Oral-B Pro 1000',
      description: 'Oral-B Pro 1000 Elektrikli Diş Fırçası',
      price: 899,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1559591935-c7c65d8c7633?w=800&h=600&fit=crop',
      specifications: {
        'Teknoloji': '3D Oscillating',
        'Pil': '1 hafta kullanım',
        'Mod': '3 Farklı Mod',
        'Bağlantı': 'Bluetooth',
        'Kullanım': 'Ağız Hijyeni',
        'Garanti': '2 yıl',
        'Menşei': 'Almanya'
      },
      tags: ['Oral-B', 'Pro 1000', 'Diş Fırçası', 'Elektrikli', 'Bluetooth'],
      variants: [
        { color: 'Beyaz', size: 'Standart', stock: 90, price: 899 },
        { color: 'Siyah', size: 'Standart', stock: 60, price: 899 }
      ],
      isFeatured: false
    },
    {
      name: 'Dyson Airwrap',
      description: 'Dyson Airwrap Multi-styler Saç Şekillendirici',
      price: 15999,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
      specifications: {
        'Güç': '1300W',
        'Teknoloji': 'Airwrap',
        'Uç': '6 Farklı Uç',
        'Sıcaklık': '3 Farklı Seviye',
        'Kullanım': 'Saç Şekillendirme',
        'Garanti': '2 yıl',
        'Menşei': 'İngiltere'
      },
      tags: ['Dyson', 'Airwrap', 'Saç Şekillendirici', 'Multi-styler', 'Premium'],
      variants: [
        { color: 'Fuchsia', size: 'Standart', stock: 20, price: 15999 },
        { color: 'Nicky', size: 'Standart', stock: 10, price: 15999 }
      ],
      isFeatured: true
    },
    {
      name: 'GHD Platinum+',
      description: 'GHD Platinum+ Düzleştirici, Profesyonel Kalite',
      price: 8999,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
      specifications: {
        'Güç': '185-200°C',
        'Teknoloji': 'Ultra Zone',
        'Plaka': '1.25" Plaka',
        'Kullanım': 'Saç Düzleştirme',
        'Garanti': '2 yıl',
        'Menşei': 'İngiltere'
      },
      tags: ['GHD', 'Platinum+', 'Düzleştirici', 'Profesyonel', 'Ultra Zone'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 30, price: 8999 },
        { color: 'Pembe', size: 'Standart', stock: 20, price: 8999 }
      ],
      isFeatured: true
    },
    {
      name: 'Clinique Moisturizer',
      description: 'Clinique Dramatically Different Moisturizing Lotion',
      price: 599,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '125ml',
        'Tip': 'Nemlendirici',
        'Cilt Tipi': 'Karma, Kuru',
        'Aktif Bileşen': 'Hyaluronic Acid',
        'Kullanım': 'Günde 2 kez',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Clinique', 'Moisturizer', 'Nemlendirici', 'Hyaluronic Acid'],
      variants: [
        { color: 'Sarı', size: '125ml', stock: 80, price: 599 },
        { color: 'Sarı', size: '200ml', stock: 40, price: 799 }
      ],
      isFeatured: false
    },
    {
      name: 'Estée Lauder Foundation',
      description: 'Estée Lauder Double Wear Stay-in-Place Foundation',
      price: 899,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '30ml',
        'Tip': 'Foundation',
        'Kapsama': 'Tam Kapsama',
        'Kullanım': 'Günlük Makyaj',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Estée Lauder', 'Foundation', 'Double Wear', 'Makyaj'],
      variants: [
        { color: '1W1 Bone', size: '30ml', stock: 50, price: 899 },
        { color: '2N1 Desert Beige', size: '30ml', stock: 30, price: 899 }
      ],
      isFeatured: true
    },
    {
      name: 'MAC Lipstick Ruby Woo',
      description: 'MAC Retro Matte Lipstick Ruby Woo, Klasik Kırmızı',
      price: 399,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '3g',
        'Tip': 'Matte Lipstick',
        'Renk': 'Ruby Woo',
        'Kullanım': 'Dudak Makyajı',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['MAC', 'Lipstick', 'Ruby Woo', 'Matte', 'Kırmızı'],
      variants: [
        { color: 'Ruby Woo', size: '3g', stock: 120, price: 399 },
        { color: 'Russian Red', size: '3g', stock: 80, price: 399 }
      ],
      isFeatured: true
    },
    {
      name: 'NARS Blush Orgasm',
      description: 'NARS Blush Orgasm, Popüler Pembe Ton',
      price: 499,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '4.8g',
        'Tip': 'Blush',
        'Renk': 'Orgasm',
        'Kullanım': 'Yanak Makyajı',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['NARS', 'Blush', 'Orgasm', 'Pembe', 'Yanak'],
      variants: [
        { color: 'Orgasm', size: '4.8g', stock: 90, price: 499 },
        { color: 'Deep Throat', size: '4.8g', stock: 60, price: 499 }
      ],
      isFeatured: true
    }
  ],
  'Toys': [
    {
      name: 'LEGO Star Wars Millennium Falcon',
      description: 'LEGO Star Wars Millennium Falcon 75192, 7541 Parça',
      price: 8999,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Parça Sayısı': '7541 Parça',
        'Yaş Grubu': '16+',
        'Boyut': '84x56x21cm',
        'Kategori': 'Star Wars',
        'Kullanım': 'Koleksiyon',
        'Garanti': '1 yıl',
        'Menşei': 'Danimarka'
      },
      tags: ['LEGO', 'Star Wars', 'Millennium Falcon', 'Koleksiyon', '7541 Parça'],
      variants: [
        { color: 'Gri', size: '7541 Parça', stock: 15, price: 8999 },
        { color: 'Gri', size: 'Küçük Model', stock: 5, price: 2999 }
      ],
      isFeatured: true
    },
    {
      name: 'Barbie Dreamhouse',
      description: 'Barbie Dreamhouse 3 Katlı Ev Seti, 70+ Aksesuar',
      price: 2999,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Kat Sayısı': '3 Kat',
        'Aksesuar': '70+ Aksesuar',
        'Yaş Grubu': '3+',
        'Boyut': '109x58x39cm',
        'Kategori': 'Barbie',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Barbie', 'Dreamhouse', '3 Kat', '70+ Aksesuar', 'Oyuncak'],
      variants: [
        { color: 'Pembe', size: '3 Kat', stock: 20, price: 2999 },
        { color: 'Pembe', size: '2 Kat', stock: 10, price: 1999 }
      ],
      isFeatured: true
    },
    {
      name: 'Hot Wheels Ultimate Garage',
      description: 'Hot Wheels Ultimate Garage, 6 Katlı, 50+ Araç',
      price: 1499,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Kat Sayısı': '6 Kat',
        'Araç Sayısı': '50+ Araç',
        'Yaş Grubu': '3+',
        'Boyut': '76x38x76cm',
        'Kategori': 'Hot Wheels',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Hot Wheels', 'Ultimate Garage', '6 Kat', '50+ Araç', 'Oyuncak'],
      variants: [
        { color: 'Mavi', size: '6 Kat', stock: 30, price: 1499 },
        { color: 'Kırmızı', size: '4 Kat', stock: 20, price: 999 }
      ],
      isFeatured: false
    },
    {
      name: 'Nintendo Switch OLED',
      description: 'Nintendo Switch OLED Model, 7" Ekran, 64GB',
      price: 12999,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&h=600&fit=crop',
      specifications: {
        'Ekran': '7" OLED',
        'Depolama': '64GB',
        'Pil': '4.5-9 saat',
        'Kullanım': 'Gaming',
        'Garanti': '2 yıl',
        'Menşei': 'Japonya'
      },
      tags: ['Nintendo', 'Switch', 'OLED', 'Gaming', '7" Ekran'],
      variants: [
        { color: 'Beyaz', size: '64GB', stock: 25, price: 12999 },
        { color: 'Neon', size: '64GB', stock: 15, price: 12999 }
      ],
      isFeatured: true
    },
    {
      name: 'PlayStation 5',
      description: 'Sony PlayStation 5 Konsol, 825GB SSD, DualSense',
      price: 19999,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop',
      specifications: {
        'Depolama': '825GB SSD',
        'Kontrolcü': 'DualSense',
        'Çözünürlük': '4K',
        'Kullanım': 'Gaming',
        'Garanti': '2 yıl',
        'Menşei': 'Japonya'
      },
      tags: ['PlayStation', 'PS5', 'Gaming', '4K', 'DualSense'],
      variants: [
        { color: 'Beyaz', size: '825GB', stock: 15, price: 19999 },
        { color: 'Siyah', size: '1TB', stock: 10, price: 21999 }
      ],
      isFeatured: true
    },
    {
      name: 'Xbox Series X',
      description: 'Microsoft Xbox Series X, 1TB SSD, 4K Gaming',
      price: 18999,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop',
      specifications: {
        'Depolama': '1TB SSD',
        'Kontrolcü': 'Xbox Wireless',
        'Çözünürlük': '4K',
        'Kullanım': 'Gaming',
        'Garanti': '2 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Xbox', 'Series X', 'Gaming', '4K', '1TB'],
      variants: [
        { color: 'Siyah', size: '1TB', stock: 20, price: 18999 },
        { color: 'Beyaz', size: '512GB', stock: 10, price: 16999 }
      ],
      isFeatured: true
    },
    {
      name: 'Monopoly Classic',
      description: 'Monopoly Klasik Oyun, Türkçe, 2-8 Oyuncu',
      price: 299,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Oyuncu Sayısı': '2-8 Oyuncu',
        'Yaş Grubu': '8+',
        'Dil': 'Türkçe',
        'Kategori': 'Strateji',
        'Kullanım': 'Aile Oyunu',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Monopoly', 'Klasik', 'Strateji', 'Aile Oyunu', 'Türkçe'],
      variants: [
        { color: 'Klasik', size: 'Standart', stock: 70, price: 299 },
        { color: 'Deluxe', size: 'Premium', stock: 30, price: 499 }
      ],
      isFeatured: false
    },
    {
      name: 'Scrabble Deluxe',
      description: 'Scrabble Deluxe Kelime Oyunu, Ahşap Taban',
      price: 399,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Oyuncu Sayısı': '2-4 Oyuncu',
        'Yaş Grubu': '10+',
        'Malzeme': 'Ahşap',
        'Kategori': 'Kelime Oyunu',
        'Kullanım': 'Eğitici',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Scrabble', 'Deluxe', 'Kelime Oyunu', 'Ahşap', 'Eğitici'],
      variants: [
        { color: 'Kahverengi', size: 'Deluxe', stock: 50, price: 399 },
        { color: 'Kahverengi', size: 'Klasik', stock: 30, price: 299 }
      ],
      isFeatured: false
    },
    {
      name: 'Jenga Giant',
      description: 'Jenga Giant Dev Blok Oyunu, 54 Parça',
      price: 599,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Parça Sayısı': '54 Parça',
        'Yaş Grubu': '6+',
        'Malzeme': 'Ahşap',
        'Kategori': 'Denge Oyunu',
        'Kullanım': 'Aile Oyunu',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Jenga', 'Giant', 'Denge Oyunu', 'Ahşap', '54 Parça'],
      variants: [
        { color: 'Kahverengi', size: 'Giant', stock: 40, price: 599 },
        { color: 'Kahverengi', size: 'Klasik', stock: 20, price: 299 }
      ],
      isFeatured: false
    },
    {
      name: 'Twister Game',
      description: 'Twister Denge Oyunu, 2-4 Oyuncu, Eğlenceli',
      price: 199,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
      specifications: {
        'Oyuncu Sayısı': '2-4 Oyuncu',
        'Yaş Grubu': '6+',
        'Malzeme': 'Plastik',
        'Kategori': 'Denge Oyunu',
        'Kullanım': 'Parti Oyunu',
        'Garanti': '1 yıl',
        'Menşei': 'ABD'
      },
      tags: ['Twister', 'Denge Oyunu', 'Parti', 'Eğlenceli', '2-4 Oyuncu'],
      variants: [
        { color: 'Çok Renkli', size: 'Standart', stock: 80, price: 199 },
        { color: 'Çok Renkli', size: 'Giant', stock: 40, price: 399 }
      ],
      isFeatured: false
    }
  ],
  'Food': [
    {
      name: 'Organic Honey 500g',
      description: 'Organik Bal 500g, Doğal, Şifa Kaynağı',
      price: 89,
      stock: 500,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '500g',
        'Tip': 'Organik',
        'Menşei': 'Anadolu',
        'Kullanım': 'Doğal Tatlandırıcı',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Organik', 'Bal', 'Doğal', '500g', 'Anadolu'],
      variants: [
        { color: 'Altın', size: '500g', stock: 300, price: 89 },
        { color: 'Altın', size: '1kg', stock: 200, price: 159 }
      ],
      isFeatured: true
    },
    {
      name: 'Extra Virgin Olive Oil',
      description: 'Sızma Zeytinyağı 1L, Ege Bölgesi, Soğuk Sıkım',
      price: 199,
      stock: 300,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop',
      specifications: {
        'Hacim': '1L',
        'Tip': 'Sızma',
        'Menşei': 'Ege Bölgesi',
        'Sıkım': 'Soğuk Sıkım',
        'Kullanım': 'Yemeklik',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Sızma', 'Zeytinyağı', 'Ege', 'Soğuk Sıkım', '1L'],
      variants: [
        { color: 'Yeşil', size: '1L', stock: 200, price: 199 },
        { color: 'Yeşil', size: '500ml', stock: 100, price: 119 }
      ],
      isFeatured: true
    },
    {
      name: 'Turkish Coffee Set',
      description: 'Türk Kahvesi Seti, Cezve + Fincan, 6 Kişilik',
      price: 299,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
      specifications: {
        'Kişi Sayısı': '6 Kişilik',
        'Malzeme': 'Bakır',
        'İçerik': 'Cezve + Fincan',
        'Kullanım': 'Türk Kahvesi',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Türk Kahvesi', 'Set', 'Bakır', '6 Kişilik', 'Cezve'],
      variants: [
        { color: 'Bakır', size: '6 Kişilik', stock: 100, price: 299 },
        { color: 'Bakır', size: '4 Kişilik', stock: 50, price: 199 }
      ],
      isFeatured: true
    },
    {
      name: 'Green Tea Collection',
      description: 'Yeşil Çay Koleksiyonu, 5 Farklı Aroma, 100 Poşet',
      price: 149,
      stock: 200,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      specifications: {
        'Poşet Sayısı': '100 Poşet',
        'Aroma': '5 Farklı Aroma',
        'Tip': 'Yeşil Çay',
        'Kullanım': 'Günlük İçecek',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Yeşil Çay', 'Koleksiyon', '5 Aroma', '100 Poşet', 'Doğal'],
      variants: [
        { color: 'Yeşil', size: '100 Poşet', stock: 120, price: 149 },
        { color: 'Yeşil', size: '50 Poşet', stock: 80, price: 89 }
      ],
      isFeatured: false
    },
    {
      name: 'Organic Dried Fruits',
      description: 'Organik Kurutulmuş Meyve Seti, 5 Çeşit, 500g',
      price: 179,
      stock: 250,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '500g',
        'Çeşit': '5 Çeşit',
        'Tip': 'Organik',
        'Kullanım': 'Atıştırmalık',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Organik', 'Kurutulmuş Meyve', '5 Çeşit', '500g', 'Atıştırmalık'],
      variants: [
        { color: 'Karışık', size: '500g', stock: 150, price: 179 },
        { color: 'Karışık', size: '1kg', stock: 100, price: 299 }
      ],
      isFeatured: false
    },
    {
      name: 'Premium Nuts Mix',
      description: 'Premium Kuruyemiş Karışımı, 1kg, 8 Çeşit',
      price: 299,
      stock: 180,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '1kg',
        'Çeşit': '8 Çeşit',
        'Tip': 'Premium',
        'Kullanım': 'Atıştırmalık',
        'Garanti': '1 yıl',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Premium', 'Kuruyemiş', '8 Çeşit', '1kg', 'Atıştırmalık'],
      variants: [
        { color: 'Karışık', size: '1kg', stock: 120, price: 299 },
        { color: 'Karışık', size: '500g', stock: 60, price: 179 }
      ],
      isFeatured: true
    },
    {
      name: 'Artisan Bread',
      description: 'El Yapımı Ekmek, Tam Buğday, 500g',
      price: 29,
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '500g',
        'Tip': 'Tam Buğday',
        'Üretim': 'El Yapımı',
        'Kullanım': 'Günlük Beslenme',
        'Garanti': '1 gün',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['El Yapımı', 'Ekmek', 'Tam Buğday', '500g', 'Taze'],
      variants: [
        { color: 'Kahverengi', size: '500g', stock: 70, price: 29 },
        { color: 'Kahverengi', size: '1kg', stock: 30, price: 49 }
      ],
      isFeatured: false
    },
    {
      name: 'Fresh Pasta Set',
      description: 'Taze Makarna Seti, 3 Çeşit, 1kg',
      price: 89,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '1kg',
        'Çeşit': '3 Çeşit',
        'Tip': 'Taze',
        'Kullanım': 'Yemek',
        'Garanti': '1 hafta',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Taze', 'Makarna', '3 Çeşit', '1kg', 'El Yapımı'],
      variants: [
        { color: 'Sarı', size: '1kg', stock: 80, price: 89 },
        { color: 'Sarı', size: '500g', stock: 40, price: 49 }
      ],
      isFeatured: false
    },
    {
      name: 'Gourmet Cheese Selection',
      description: 'Gurme Peynir Seçkisi, 5 Çeşit, 500g',
      price: 399,
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
      specifications: {
        'Ağırlık': '500g',
        'Çeşit': '5 Çeşit',
        'Tip': 'Gurme',
        'Kullanım': 'Kahvaltı, Yemek',
        'Garanti': '1 hafta',
        'Üretim Yeri': 'Türkiye'
      },
      tags: ['Gurme', 'Peynir', '5 Çeşit', '500g', 'Premium'],
      variants: [
        { color: 'Karışık', size: '500g', stock: 50, price: 399 },
        { color: 'Karışık', size: '250g', stock: 30, price: 249 }
      ],
      isFeatured: true
    },
    {
      name: 'Dark Chocolate Truffles',
      description: 'Bitter Çikolata Trüf, 12 Adet, %70 Kakao',
      price: 199,
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=600&fit=crop',
      specifications: {
        'Adet': '12 Adet',
        'Kakao Oranı': '%70',
        'Tip': 'Bitter Çikolata',
        'Kullanım': 'Tatlı, Hediye',
        'Garanti': '1 ay',
        'Üretim Yeri': 'Belçika'
      },
      tags: ['Bitter Çikolata', 'Trüf', '12 Adet', '%70 Kakao', 'Premium'],
      variants: [
        { color: 'Kahverengi', size: '12 Adet', stock: 100, price: 199 },
        { color: 'Kahverengi', size: '6 Adet', stock: 50, price: 119 }
      ],
      isFeatured: true
    }
  ]
};
