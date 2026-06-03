# Lison CRM

O'quv markazi boshqaruv tizimi (Next.js + Supabase + Vercel)

## Funksiyalar

- **Autentifikatsiya** - Login/logout, rol asosida kirish
- **Superadmin paneli** - Fanlar, o'qituvchilar, guruhlar, foydalanuvchilar boshqaruvi
- **Resepshn paneli** - Yangi o'quvchi ro'yxatga olish, guruhga biriktirish
- **O'quvchilar** - Ro'yxat, qidirish, tahrirlash, guruhlardan chiqarish
- **To'lovlar** - Qabul qilish, oylik filtr, jami hisoblash
- **Davomat** - Kunlik davomat belgilash (keldi/kelmadi/kech)
- **Dashboard** - Statistika va so'nggi faoliyat

## Rollar

| Rol | Huquqlar |
|-----|---------|
| Superadmin | Hamma funksiyalar + foydalanuvchilar boshqaruvi |
| Resepshn | O'quvchilar, to'lovlar, davomat, guruhlar ko'rish |

## Ishga tushirish

### 1. Supabase sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating
2. SQL Editor da `supabase/migrations/001_initial_schema.sql` ni ishga tushiring
3. Project Settings > API dan URL va keys ni oling

### 2. Environment variables

```bash
cp .env.example .env.local
```

`.env.local` ni to'ldiring:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Birinchi admin yaratish

Supabase Dashboard > Authentication > Users > "Add user" bosing, email va parol kiriting.

Keyin SQL Editor da:
```sql
INSERT INTO users (id, email, full_name, role)
VALUES ('auth-user-uuid-here', 'admin@example.com', 'Admin', 'superadmin');
```

### 4. Lokal ishga tushirish

```bash
npm install
npm run dev
```

## Vercel Deploy

1. GitHub ga push qiling
2. [vercel.com](https://vercel.com) da loyihani import qiling
3. Environment variables ni qo'shing (`.env.example` dagi barcha kalitlar)
4. Deploy!

## Texnologiyalar

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth + RLS)
- **Lucide React** (icons)
