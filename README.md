# Node.js API on Netlify

This project is a Node.js API that can be deployed on Netlify. It provides endpoints for task management and integrates with the Gemini API for content generation.

## Project Structure

```
nodejs-api-netlify
├── src
│   ├── server.js          # Entry point of the application
│   ├── routes             # Contains route definitions
│   │   ├── taskRoutes.js  # Routes for task management
│   │   └── geminiRoutes.js # Route for Gemini analysis
│   ├── models             # Contains Mongoose models
│   │   └── Task.js        # Task model definition
│   └── utils              # Utility functions
│       └── index.js       # Utility functions (to be implemented)
├── netlify.toml           # Netlify configuration file
├── package.json           # npm configuration file
├── .env                   # Environment variables
└── README.md              # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nodejs-api-netlify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add your MongoDB URI and any necessary API keys:
   ```
   MONGODB_URI=<your_mongodb_uri>
   GEMINI_API_KEY=<your_gemini_api_key>
   ```

4. **Run the application locally:**
   ```bash
   node src/server.js
   ```

5. **Deploying to Netlify:**
   Ensure you have the `netlify-cli` installed, then run:
   ```bash
   netlify deploy
   ```

## Usage

- **Task Management Endpoints:**
  - `GET /api/tasks`: Retrieve all tasks or filter by category.
  - `POST /api/tasks`: Add a new task.
  - `PUT /api/tasks/:id`: Update an existing task by ID.
  - `DELETE /api/tasks/:id`: Delete a task by ID.

- **Gemini Analysis Endpoint:**
  - `POST /api/gemini/gemini-analysis`: Analyze a prompt using the Gemini API.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.