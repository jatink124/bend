// netlify/functions/tasks.js

const mongoose = require('mongoose');
const Task = require('../../src/models/Task'); // Your Mongoose Task model

// Database connection function
let conn = null;
const uri = process.env.MONGODB_URI; // Ensure MONGODB_URI is set in Netlify environment variables

async function connectToDatabase() {
  if (conn === null) {
    conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // Other recommended options for serverless environments:
      maxPoolSize: 1, // Maintain up to 1 socket connection
      minPoolSize: 0, // No minimum pool size
      family: 4, // Use IPv4, skip trying IPv6
    }).then(() => mongoose.connection);
  }
  return conn;
}

exports.handler = async (event, context) => {
  // Ensure the database connection is established before processing the request
  context.callbackWaitsForEmptyEventLoop = false; // Important for keeping the connection alive across invocations

  try {
    await connectToDatabase(); // Connect to MongoDB

    // Set up CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Allow all origins for development, narrow this in production
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle OPTIONS preflight requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204, // No Content
        headers: headers,
        body: '',
      };
    }

    let responseBody;
    let statusCode = 200;

    switch (event.httpMethod) {
      case 'GET':
        // Handle GET requests: Fetch all tasks or a single task by ID
        const taskId = event.queryStringParameters?.id; // Get ID from query parameter
        if (taskId) {
          // Fetch single task
          const task = await Task.findById(taskId);
          if (task) {
            responseBody = JSON.stringify(task);
          } else {
            statusCode = 404;
            responseBody = JSON.stringify({ message: 'Task not found' });
          }
        } else {
          // Fetch all tasks
          const tasks = await Task.find({});
          responseBody = JSON.stringify(tasks);
        }
        break;

      case 'POST':
        // Handle POST requests: Create a new task
        const newTaskData = JSON.parse(event.body); // Parse the request body
        const newTask = new Task(newTaskData);
        await newTask.save();
        statusCode = 201; // Created
        responseBody = JSON.stringify(newTask);
        break;

      case 'PUT':
        // Handle PUT requests: Update an existing task
        const updateTaskId = event.queryStringParameters?.id;
        if (!updateTaskId) {
          statusCode = 400;
          responseBody = JSON.stringify({ message: 'Task ID is required for update' });
          break;
        }
        const updateData = JSON.parse(event.body);
        const updatedTask = await Task.findByIdAndUpdate(updateTaskId, updateData, { new: true });
        if (updatedTask) {
          responseBody = JSON.stringify(updatedTask);
        } else {
          statusCode = 404;
          responseBody = JSON.stringify({ message: 'Task not found' });
        }
        break;

      case 'DELETE':
        // Handle DELETE requests: Delete a task
        const deleteTaskId = event.queryStringParameters?.id;
        if (!deleteTaskId) {
          statusCode = 400;
          responseBody = JSON.stringify({ message: 'Task ID is required for deletion' });
          break;
        }
        const deletedTask = await Task.findByIdAndDelete(deleteTaskId);
        if (deletedTask) {
          responseBody = JSON.stringify({ message: 'Task deleted successfully' });
        } else {
          statusCode = 404;
          responseBody = JSON.stringify({ message: 'Task not found' });
        }
        break;

      default:
        statusCode = 405; // Method Not Allowed
        responseBody = JSON.stringify({ message: 'Method Not Allowed' });
        break;
    }

    return {
      statusCode: statusCode,
      headers: headers,
      body: responseBody,
    };

  } catch (error) {
    console.error('Error in tasks function:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};

