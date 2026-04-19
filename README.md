# Cognivoice

Cognivoice is a language-inclusive speech analysis tool designed to assess cognitive health indicators through short voice recordings. It supports multiple languages and dialects common in Singapore, providing feedback in simple, easy-to-understand terms.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository (or extract the ZIP).
2. Install dependencies:
   ```bash
   npm install
   ```

### 🔑 Setting Up the Gemini API Key
This app requires a Google Gemini API Key to perform speech analysis.

1. **Get an API Key**: Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) to generate a free key.
2. **Configure Environment**:
   - Create a file named `.env` in the root directory of this project.
   - Copy the following line into your `.env` file:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Replace `your_actual_api_key_here` with the key you generated.

### Running the App
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🛠 Features
- **Multilingual Support**: English, Mandarin, Malay, Tamil, Hokkien, Cantonese, and Teochew.
- **Audio Recording**: High-quality speech capture directly in the browser.
- **AI Analysis**: Real-time analysis of vocabulary, sentence structure, and speech patterns.
- **History Tracking**: Keep track of previous assessments locally.

## ⚖️ Disclaimer
This tool is for educational and research purposes only and is not a clinical diagnostic tool. Always consult a healthcare professional for medical advice.
