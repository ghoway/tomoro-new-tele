# Tomoro Telegram Bot - Vercel Standalone

🚀 **Production-ready Telegram bot for Tomoro registration deployed on Vercel serverless functions.**

## 📁 **Project Structure**

This is a **standalone project** with its own repository:
- **Repository**: https://github.com/ghoway/tomoro-new-tele
- **Deploy**: Vercel serverless functions
- **Base**: References original project from `/tomoro-new` (read-only)

## ✨ **Features**

### **🎯 Core Functionality**
- ✅ **Manual Registration** - Phone → OTP → PIN flow
- ✅ **Real Tomoro API** - Actual OTP requests and registration
- ✅ **State Management** - Multi-step conversation flow
- ✅ **Database Support** - SQLite with fallback
- ✅ **History Tracking** - Registration records
- ✅ **Settings Management** - API key and invitation codes
- ✅ **Admin Panel** - User management and history
- ✅ **Error Handling** - Comprehensive error recovery

### **🔧 Technical Stack**
- **Runtime**: Vercel serverless functions
- **Framework**: Node.js with ES modules
- **Database**: SQLite (file-based with in-memory fallback)
- **API Integration**: Real Tomoro Coffee API
- **Security**: Webhook secret verification
- **State**: In-memory Map for conversations

## 🚀 **Quick Deploy Guide**

### **1. Clone and Deploy**
```bash
# Clone standalone project
git clone https://github.com/ghoway/tomoro-new-tele
cd tomoro-new-tele

# Deploy to Vercel
npm install
vercel --prod
```

### **2. Configure Environment Variables**
Go to Vercel dashboard → Settings → Environment Variables:

```
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_IDS=5845170034,other_admin_ids
WEBHOOK_SECRET=your_random_secret_string
```

### **3. Setup Webhook**
After deployment, run:

```bash
# Set your bot token
export BOT_TOKEN=your_telegram_bot_token_here

# Run the webhook setup script
./setup-webhook.sh your-project.vercel.app
```

### **4. Test Registration Flow**
```bash
# Test complete Tomoro registration
./test-tomoro.sh your-project.vercel.app
```

## 📱 **Registration Flow**

1. **Start** → `/start` command
2. **Menu** → Choose "📱 Registrasi Manual"
3. **Phone** → Enter phone number (81234567890)
4. **OTP** → Receive and enter OTP code
5. **PIN** → Set 6-digit PIN
6. **Success** → Account created and saved

## 🛠️ **File Structure**

```
vercel/
├── api/
│   └── webhook.js              # Main webhook handler
├── src/
│   ├── handlers/
│   │   ├── startHandler.js      # /start command
│   │   └── messageHandler.js   # Text messages
│   ├── commands/
│   │   ├── registration.js      # Registration flow
│   │   ├── settings.js         # Settings management
│   │   ├── status.js          # Status display
│   │   ├── history.js         # History viewing
│   │   └── admin.js           # Admin panel
│   ├── bot.js                # Telegram bot instance
│   ├── db.js                 # Database management
│   ├── state.js              # Conversation state
│   ├── ui.js                 # Menu definitions
│   ├── tomoro-service.js     # Tomoro API calls
│   └── tomoro-header.js      # API headers
├── file/
│   └── schema.sql            # Database schema
├── public/
│   └── index.html            # Landing page
├── package.json              # Dependencies
├── vercel.json             # Vercel config
├── setup-webhook.sh        # Webhook setup
├── test-tomoro.sh         # Registration test
└── README.md               # This file
```

## 🔧 **Configuration**

### **Environment Variables**
| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | ✅ | Telegram bot token from @BotFather |
| `ADMIN_IDS` | ❌ | Comma-separated admin user IDs |
| `WEBHOOK_SECRET` | ❌ | Secret token for webhook security |

### **Vercel.json Features**
- **Function timeout**: 10 seconds
- **Memory**: 512MB
- **CORS headers** for API endpoints
- **Output directory**: public/

## 📊 **Monitoring & Debugging**

### **Function Logs**
- Go to Vercel dashboard → Functions tab
- All incoming updates are logged with detailed output
- Error handling with comprehensive logging

### **Testing Scripts**
- `setup-webhook.sh` - Automatic webhook configuration
- `test-tomoro.sh` - Complete registration flow test
- Both scripts provide detailed feedback

## 🚨 **Security Features**

- ✅ **Webhook Secret Verification**
- ✅ **Admin ID Validation**
- ✅ **Input Sanitization**
- ✅ **Error Message Sanitization**
- ✅ **Database Error Handling**

## 🔄 **Updates & Maintenance**

### **Database Persistence**
- SQLite file stored in `/tmp` (serverless)
- In-memory fallback for edge cases
- Schema auto-creation on first run

### **State Management**
- Conversation state in memory Map
- Automatic cleanup on completion/cancellation
- Multi-user support isolation

## 🎯 **Deployment Benefits**

### **Vercel Advantages**
- ⚡ **Global CDN** - Fast responses worldwide
- 🔄 **Auto-scaling** - Handle concurrent users
- 🔒 **HTTPS included** - Secure connections
- 📊 **Built-in analytics** - Function monitoring
- 💰 **Free tier** - Cost-effective deployment

### **Serverless Architecture**
- 🚀 **No server management** - Focus on features
- ⚡ **Fast cold starts** - Optimized code
- 📈 **Horizontal scaling** - Automatic load handling
- 🔧 **Environment isolation** - Secure config

---

**Made with ❤️ for Tomoro Coffee registration automation**

**Repository**: https://github.com/ghoway/tomoro-new-tele
**Deploy**: https://vercel.com/ghoway/tomoro-new-tele