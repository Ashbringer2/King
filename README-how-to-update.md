# How to Get the Latest Update of This Project on a New Computer

1. **Install Git and Node.js**
   - Download and install [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/).

2. **Clone the Repository**
   - Open PowerShell and run:
     ```powershell
     git clone https://github.com/Ashbringer2/King2.git
     cd King2
     ```

3. **Install Dependencies**
   - For the backend:
     ```powershell
     cd money-tracker-admin
     npm install
     ```
   - For the frontend:
     ```powershell
     cd ../client
     npm install
     ```

4. **Get the Latest Updates**
   - To pull the latest changes from GitHub at any time, run:
     ```powershell
     git pull origin main
     ```

5. **Start the Application**
   - Start the backend:
     ```powershell
     cd money-tracker-admin
     node server.js
     ```
   - Start the frontend (in a new terminal):
     ```powershell
     cd client
     npm start
     ```

6. **Ready to Work!**
   - Make your changes, then use `git add .`, `git commit -m "your message"`, and `git push` to save your work to GitHub.

---

**Tip:**
- Always run `git pull origin main` before you start working to make sure you have the latest version.
- If you work on multiple computers, always push your changes before switching to another device.
