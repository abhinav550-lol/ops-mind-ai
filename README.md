# OpsMindAI — SOP Intelligence Platform

An AI-powered platform where **companies** upload Standard Operating Procedure (SOP) documents, and **users** query them through natural language using RAG (Retrieval-Augmented Generation).

## Features

- **Company Portal** — Upload, manage, and delete SOP documents (PDF, DOCX, TXT, XLSX)
- **User Portal** — Browse companies and explore their published SOPs
- **AI Chat** — Multi-turn conversational Q&A grounded in company SOP documents
- **Quick Ask** — One-shot RAG queries with source attribution
- **Document Ingestion** — Automatic text extraction, chunking, and vector embedding pipeline
- **Role-Based Access** — Separate dashboards and permissions for `company` and `user` roles

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Vector Search | MongoDB Atlas Vector Search |
| AI / LLM | Groq API (Llama 3) |
| Embeddings | HuggingFace Inference API |
| File Parsing | pdf-parse, Mammoth, xlsx, Tesseract.js |

## Project Structure

```
ops-mind-ai/
├── backend/
│   ├── ai/                  # Ingestion pipeline, RAG service, embedding
│   ├── controller/          # Route handlers (user, file, rag, chat)
│   ├── models/              # Mongoose schemas (User, File, DocumentChunk, Chat, Message)
│   ├── routes/              # Express route definitions
│   ├── middleware/           # Multer config for file uploads
│   ├── utils/               # Auth guards (isLoggedIn, isCompany)
│   ├── error/               # Custom error classes + global handler
│   ├── services/            # Chat service logic
│   ├── uploads/             # Uploaded SOP files (git-ignored)
│   └── index.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── company/     # CompanyDashboard, CompanyUploads
│   │   │   ├── user/        # UserDashboard, CompanyBrowser, CompanyDetail
│   │   │   ├── ChatPage.jsx
│   │   │   ├── QuickAskPage.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── components/      # Button, Card, Input, RagAsk, ChatSidebar, ChatWindow
│   │   ├── layouts/         # DashboardLayout (sidebar + topbar)
│   │   ├── services/        # API service, Chat service, RAG service
│   │   ├── utils/           # AuthContext, helpers
│   │   └── App.jsx          # Root router
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB Atlas** cluster with Vector Search enabled
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **HuggingFace API key** — [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd link-cube-v1
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_CONNECTION_STRING=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
SESSION_SECRET=your-session-secret
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_CHAT_MODEL=llama3-8b-8192
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxx
```

### 3. MongoDB Atlas Vector Search Index

Go to **Atlas → your cluster → Atlas Search → Create Index → JSON Editor**.

- **Collection:** `documentchunks`
- **Index name:** `chunk_vector_index`

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "companyId"
    },
    {
      "type": "filter",
      "path": "fileId"
    }
  ]
}
```

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

### 5. Run the app

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### As a Company

1. **Sign up** with the "Company" role
2. Go to **Upload SOPs** → drag-and-drop your SOP documents
3. Wait for ingestion (status badge shows: Queued → Extracting → Chunking → Embedding → Ready ✓)
4. Use **Chat with SOPs** or **Quick Ask** to query your own documents
5. **Delete** any SOP via the 🗑️ button — removes the file and all indexed chunks

### As a User

1. **Sign up** with the "User" role
2. **Browse Companies** → select a company
3. View their published SOPs and query them with AI
4. Use **Chat with SOPs** for multi-turn conversations scoped to a company
5. Use **Quick Ask** for instant one-shot answers

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/user/register` | — | Register (company or user) |
| POST | `/api/user/login` | — | Login |
| POST | `/api/user/logout` | ✓ | Logout |
| GET | `/api/user/me` | ✓ | Current user profile |
| GET | `/api/user/companies` | ✓ | List all company accounts |
| POST | `/api/files/upload` | Company | Upload single SOP |
| POST | `/api/files/upload-multiple` | Company | Upload multiple SOPs |
| GET | `/api/files/my-uploads` | Company | List company's SOPs |
| GET | `/api/files/company/:id` | ✓ | Browse a company's SOPs |
| GET | `/api/files/:id` | ✓ | Get file metadata |
| DELETE | `/api/files/:id` | Company | Delete SOP + chunks |
| POST | `/api/rag/ask` | ✓ | RAG Q&A (body: question, companyId) |
| POST | `/api/rag/ask-file/:fileId` | ✓ | RAG Q&A scoped to one file |
| POST | `/api/chat` | ✓ | Create chat session |
| GET | `/api/chat` | ✓ | List user's chats |
| GET | `/api/chat/:id/messages` | ✓ | Get chat messages |
| POST | `/api/chat/:id/message` | ✓ | Send message in chat |
| DELETE | `/api/chat/:id` | ✓ | Delete chat |

