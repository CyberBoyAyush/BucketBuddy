# 🪣 BucketBuddy

A modern, secure, and intuitive web interface for managing your cloud storage across AWS S3, Cloudflare R2, and other S3-compatible providers. Built with Next.js 15, TypeScript, and enterprise-grade security features.

## ✨ Key Features

### 🔐 **Enterprise Security**
- **Password-based encryption** for all bucket credentials using AES-256
- **Secure authentication** with Better Auth
- **Production-grade security** with hashed passwords and encrypted storage
- **Session management** with configurable expiration

### 🌐 **Multi-Provider Support**
- **AWS S3** - Full compatibility with Amazon S3
- **Cloudflare R2** - Optimized for Cloudflare's object storage
- **DigitalOcean Spaces** - Seamless integration
- **Wasabi, Backblaze B2** - Cost-effective storage options
- **Any S3-compatible service** - Universal compatibility

### 📁 **Advanced File Management**
- **Dual view modes** - Grid view with image previews and detailed list view
- **Sortable columns** - Sort by name, type, size, and modification date
- **Bulk operations** - Select multiple files for batch delete, move, or download
- **Folder management** - Create, navigate, and organize folders
- **File preview** - Built-in preview for images, PDFs, and text files
- **Drag & drop uploads** - Intuitive file uploading with progress tracking

### 🎨 **Modern UI/UX**
- **Hetzner-inspired theme** - Clean, professional dark interface
- **Responsive design** - Works perfectly on desktop, tablet, and mobile
- **Image preview caching** - Optimized performance with smart caching
- **Custom modals** - Themed confirmation dialogs and file operations
- **Real-time feedback** - Toast notifications and loading states

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **pnpm** (recommended package manager)
- **PostgreSQL/MySQL/SQLite** database

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/cyberboyayush/bucketbuddy.git
cd bucketbuddy
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Configure your `.env` file:**
```env
# Database URL (Postgres recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/bucketbuddy"

# Better Auth configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# App configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. **Set up the database:**
```bash
npx prisma db push
npx prisma generate
```

6. **Start the development server:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access BucketBuddy!

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4 with custom Hetzner-inspired theme
- **Database**: Prisma ORM with PostgreSQL/MySQL/SQLite support
- **Authentication**: Better Auth with session management
- **Cloud Storage**: AWS SDK v3 for S3-compatible services
- **UI Components**: Custom components with Lucide React icons
- **State Management**: Zustand for client-side state
- **Security**: AES-256 encryption with bcryptjs for password hashing
- **File Handling**: React Dropzone for drag-and-drop uploads

## � Detailed Features

### File Browser
- **Grid View**: Image thumbnails with hover effects and file type icons
- **List View**: Detailed file information with sortable columns
- **Search & Filter**: Real-time search with file type filtering
- **Bulk Selection**: Multi-select with checkbox interface
- **File Operations**: Download, delete, rename, move, and preview
- **Folder Navigation**: Breadcrumb navigation with back button support

### File Management
- **Upload**: Drag-and-drop with progress tracking and error handling
- **Preview**: Built-in viewer for images, PDFs, and text files
- **Download**: Direct download with presigned URLs
- **Move**: Folder selection interface for organizing files
- **Delete**: Confirmation modals with bulk delete support
- **Create Folders**: New folder creation with validation

### Security Features
- **Credential Encryption**: All S3 credentials encrypted with user passwords
- **Password Verification**: Secure password hashing and verification
- **Session Management**: Configurable session expiration
- **Access Control**: User-based bucket permissions
- **Secure API**: Protected endpoints with authentication middleware

### User Experience
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Dark Theme**: Professional Hetzner-inspired color scheme
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error messages and recovery options
- **Toast Notifications**: Real-time feedback for all operations
- **Keyboard Navigation**: Full keyboard accessibility support

## 📦 Supported Storage Providers

| Provider | Status | Notes |
|----------|--------|-------|
| **AWS S3** | ✅ Full Support | Native S3 compatibility |
| **Cloudflare R2** | ✅ Full Support | Zero egress fees |
| **DigitalOcean Spaces** | ✅ Full Support | S3-compatible API |
| **Wasabi** | ✅ Full Support | Cost-effective storage |
| **Backblaze B2** | ✅ Full Support | S3-compatible endpoint |
| **MinIO** | ✅ Full Support | Self-hosted option |
| **Any S3-compatible** | ✅ Full Support | Custom endpoint support |

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/bucketbuddy"

# Authentication
BETTER_AUTH_SECRET="your-256-bit-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup
The application uses Prisma ORM with support for multiple databases:

```bash
# For PostgreSQL (recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/bucketbuddy"

# For MySQL
DATABASE_URL="mysql://username:password@localhost:3306/bucketbuddy"

# For SQLite (development)
DATABASE_URL="file:./dev.db"
```

## 🚀 Production Deployment

### Build Commands
```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Build the application
pnpm build

# Start production server
pnpm start
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing code style and formatting
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support & Contact

- **Email**: hi@aysh.me
- **GitHub**: [cyberboyayush](https://github.com/cyberboyayush)
- **Issues**: [GitHub Issues](https://github.com/cyberboyayush/bucketbuddy/issues)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI inspired by [Hetzner](https://www.hetzner.com/) design system
- Icons by [Lucide](https://lucide.dev/)
- Authentication powered by [Better Auth](https://www.better-auth.com/)

---

**Built with ❤️ for developers who need reliable, secure, and beautiful cloud storage management.**
