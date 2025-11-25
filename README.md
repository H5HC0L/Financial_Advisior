Financial Advisor Dashboard (FIN-AI-DASHBOARD)A financial advisor dashboard built with React, Vite, and Tailwind CSS. This project serves as a collaborative base for the team to build financial analysis and advisory features.🚀 Tech StackFramework: React (Vite)Styling: Tailwind CSSPackage Manager: npm🛠️ Getting StartedFollow these steps to set up the project locally on your machine.1. PrerequisitesMake sure you have Node.js installed. You can check by running:node -v
2. Clone the RepositoryOpen your terminal and clone the repo:git clone https://github.com/Fimo0N/Financial_Advisior.git
cd Financial_Advisior/fin-ai-dashboard
3. Install DependenciesInstall all the necessary packages (this creates the node_modules folder):npm install
4. Run the Development ServerStart the local server to see the app in your browser:npm run dev
The app will usually run at http://localhost:5173🤝 How to ContributeTo avoid conflicts, please follow this workflow when adding new features:Pull the latest changes from the main branch:git checkout main
git pull origin main
Create a new branch for your specific feature:git checkout -b feature/your-feature-name
# Example: git checkout -b feature/login-page
Make your changes and commit them:git add .
git commit -m "Added login page layout"
Push your branch to GitHub:git push origin feature/your-feature-name
Go to GitHub and open a Pull Request (PR) to merge your changes into main.📦 Building for ProductionTo create a production-ready build:npm run build
