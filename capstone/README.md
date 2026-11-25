# Intelligent File Organizer and Duplicate Finder

An AI-powered SaaS web application designed to automatically organize files, detect exact byte duplicates using cryptographic SHA-256 hashing, manage cloud & local storage, and categorize documents using semantic heuristics and modern interactive 3D visualizations.

---

## 🌟 Key Features

### 1. Futuristic 3D User Interface & Glassmorphism
- **Interactive 3D Hero Scene**: Built with native Three.js featuring floating folders, glossy documents, holographic rings, and dynamic particle streams reacting to cursor movement.
- **Dynamic 3D Storage Core**: Central orbital data sphere that transforms its color and internal pulsation based on actual user storage volume and category distribution.
- **Real-Time 3D Sorting Pipeline**: Interactive simulator demonstrating files flying from a central hopper into categorized destination bins with particle trails.
- **Glassmorphic Theme**: Frosted glass panels, ambient blur backdrops, soft shadows, and seamless Dark/Light mode toggle.

### 2. Comprehensive Landing Page
- Headline: *"Organize Smarter. Find Duplicates. Save Space."*
- Interactive live statistics counters (Files Analyzed, Duplicates Purged, Reclaimed Storage).
- Interactive 3D auto-sort simulation.
- Feature breakdown, step-by-step pipeline, testimonials, interactive FAQ accordion, and navigation footer.

### 3. Cryptographic Duplicate File Finder
- **Zero False Positives**: Uses the browser's native **Web Crypto API** (`crypto.subtle.digest('SHA-256')`) for byte-level cryptographic integrity.
- **Side-by-Side Duplicate File Inspector**: Compares file name, size, SHA-256 hash match, modified date, location, and visual thumbnail.
- **Safe Retention Guard**: Original source files are intelligently designated by oldest timestamp or cleanest path and protected from deletion.
- **Audit Reports**: Export duplicate scan reports in CSV and JSON formats.

### 4. Smart File Organizer with AI Semantic Classification
- **10 Core Categories**: Documents, Images, Videos, Audio, Archives, Programming Files, Presentations, Spreadsheets, PDFs, and Other Files.
- **AI Semantic Classification**: Parses filenames, document text samples, and metadata patterns to recommend multi-level hierarchies:
  - *Example*: `Machine_Learning_Assignment.pdf` → `Academic / Assignments / Machine Learning`
  - *Example*: `AWS_Billing_Invoice_October_2024.pdf` → `Finance / Invoices & Receipts / 2024 / AWS Cloud`
- **Confirmation Review**: Preview proposed folder relocations with confidence percentage and AI reasoning before applying.
- **One-Click Undo**: Instant rollback of organization operations via Activity History.

### 5. Storage Analyzer & Capacity Radar
- **Visual Capacity Gauge**: Real-time breakdown of used storage, recoverable duplicate storage, and available quota.
- **Interactive Category Treemap**: Bar distribution comparing bytes occupied across file types.
- **Storage Consumers Ranking**: Identifies the largest files occupying space with direct inspection and deletion controls.
- **Dormant & Temporary Files Audit**: Flags files untouched for >180 days and hidden temporary lock files (`.tmp`, `~$`, `.bak`, `.DS_Store`).

### 6. Intelligent Cleanup Assistant
- **Storage Health Rating (0-100)**: Evaluates repository organization and duplication index.
- **Risk-Graded Recommendations**: Low, Medium, and High risk tiers with estimated savings.

### 7. Smart Multi-Facet Search
- Search across filename, extension (`.pdf`, `.tsx`, `.png`), SHA-256 hash, category, size brackets, date intervals, and inner document text snippets.

### 8. File Previews & Media Player
- Built-in preview modal for Images (with dimensions and zoom), Audio (with player controls), Video, Code/Text (with line numbers), and PDF metadata.

### 9. Activity History with Rollback Engine
- Chronological event timeline recording file uploads, moves, renames, AI reorganizations, and purges, with a working **Undo** button.

### 10. Reports & Analytics
- Visual Recharts trends, printable executive audit summary, and full CSV export.

### 11. Role-Based Admin Dashboard
- Restricted admin portal providing registered tenant directory, server status, and cryptographic engine health.

### 12. Complete Authentication & Supabase Integration
- Built-in user profile management, session switching (Regular User vs Administrator), and Supabase PostgreSQL integration with copyable SQL setup script.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphism, CSS Gradients
- **3D Graphics**: Three.js (WebGL with dynamic lighting & requestAnimationFrame)
- **Visualizations**: Recharts (Pie, Area, Bar, Line)
- **Local Storage Engine**: IndexedDB (Blob persistence for offline file storage)
- **Security & Hashes**: Web Crypto API (SubtleCrypto SHA-256)
- **Cloud Backend**: Supabase (PostgreSQL, Row Level Security)
- **Icons & Polish**: Lucide React, Canvas Confetti

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🚀 Usage

1. **Sign In or Register**:
   Create your personal account with your own credentials (no preloaded demo accounts).
2. **Upload Your Files**:
   Drag and drop files or whole directory trees using the **Upload** / **Folder** controls. The browser's native Web Crypto API will instantly calculate real SHA-256 hashes and analyze files.
3. **Smart Organization & Deduplication**:
   Review AI classification proposals, examine exact duplicate groups, and safely manage your storage.
