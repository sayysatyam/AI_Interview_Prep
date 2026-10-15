# InterviewPrep — AI-Powered Interview Preparation Platform

InterviewPrep is a full-stack web application designed to help students prepare for technical interviews through AI-powered mock interviews, coding assessments, and personalized performance feedback.

The platform combines AI-driven question generation, automated code execution, timed assessment sessions, and performance analytics in one place.

## ✨ Features

- **AI-Powered Mock Interviews:** Practice interview questions with AI-driven evaluation and personalized feedback.
- **AI-Generated Coding Questions:** Generate coding problems across different topics and difficulty levels.
- **Online Code Execution:** Execute code in C++, Python, and JavaScript using the Judge0 API.
- **Automated Test-Case Evaluation:** Validate coding submissions against test cases.
- **Timed Coding Sessions:** Complete coding assessments with time limits and automatic submission handling.
- **Performance Analytics:** Review test-case results, execution time, memory usage, and interview feedback.
- **Secure Payment Integration:** Razorpay integration with server-side payment verification and three subscription plans.
- **Redis Caching and Rate Limiting:** Cache frequently accessed data and control excessive API requests.
- **Nginx Reverse Proxy and Load Balancing:** Route incoming traffic and distribute requests across configured backend instances.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Caching and Rate Limiting | Redis |
| AI Integration | OpenRouter |
| Code Execution | Judge0 API |
| Payments | Razorpay |
| Reverse Proxy and Load Balancing | Nginx |
| Deployment | Docker, Render |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
                    User
                     |
                     v
              React Frontend
                     |
                     v
               Nginx Proxy
                     |
                     v
          Express.js Backend
             /      |      \
            v       v       v
        MongoDB    Redis   OpenRouter
                            |
                            v
                       AI Responses

        Express.js Backend
                 |
                 v
             Judge0 API

        Express.js Backend
                 |
                 v
              Razorpay
```

*Note: This is a logical overview. Actual request routing and service connections depend on your deployment configuration.*

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- MongoDB
- Redis
- Git

You will also need API credentials for the external services you use, such as OpenRouter, Judge0, and Razorpay.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Install Dependencies

Install the frontend and backend dependencies using the package managers and directory structure configured in your repository.

For separate frontend and backend folders, for example:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 3. Configure Environment Variables

Create `.env` files in the appropriate directories and configure the required variables.

Example backend configuration:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

OPENROUTER_API_KEY=your_openrouter_api_key

JUDGE0_URL=your_judge0_api_url
JUDGE0_HOST=your_judge0_api_host
RAPIDAPI_KEY=your_rapidapi_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use the exact variable names expected by your codebase. Configure frontend environment variables separately if required.

**Important:** Never commit API keys, payment secrets, database credentials, or production environment files to GitHub.

### 4. Start the Application

Start the backend and frontend using the scripts defined in their respective `package.json` files.

For example, if your project uses these scripts:

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

Run each command from its respective project directory.

## 🔐 Security and Performance

- Server-side validation of payment requests and payment signatures.
- Redis-based API rate limiting to control excessive requests.
- Redis caching to reduce repeated data retrieval where applicable.
- Nginx reverse proxy configuration for backend traffic routing.
- Environment variables for sensitive credentials.
- Timed assessment handling and submission management.

## 📊 Performance and Assessment Reports

InterviewPrep provides assessment information such as:

- Number of test cases passed
- Total test cases
- Code execution time
- Memory usage
- AI-generated interview feedback

These details help users understand their performance and identify areas for improvement.

## 🔮 Future Improvements

- Add more programming languages and assessment types.
- Improve AI response times and question-generation reliability.
- Expand analytics with historical performance comparisons.
- Add more comprehensive automated testing.
- Improve deployment monitoring and scalability.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## 📄 License

Add a license file if you intend to distribute this project under an open-source license.

---

**Built to make interview preparation more interactive, practical, and accessible.**
