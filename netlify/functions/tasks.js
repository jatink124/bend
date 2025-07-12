// netlify/functions/tasks.js

// Import your Task model
// Adjust the path based on your actual file structure relative to this function file.
const Task = require('../../src/models/Task'); // Assuming Task.js exports the Task model

// You might need to initialize your database connection here if it's not already handled by the model.
// For example, if your Task model connects to MongoDB, you'd ensure that connection is established.
// For simplicity, this example assumes the model handles its own connection or is stateless.

exports.handler = async (event, context) => {
  try {
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
          const task = await Task.findById(taskId); // Assuming Task.findById exists
          if (task) {
            responseBody = JSON.stringify(task);
          } else {
            statusCode = 404;
            responseBody = JSON.stringify({ message: 'Task not found' });
          }
        } else {
          // Fetch all tasks
          const tasks = await Task.find({}); // Assuming Task.find exists
          responseBody = JSON.stringify(tasks);
        }
        break;

      case 'POST':
        // Handle POST requests: Create a new task
        const newTaskData = JSON.parse(event.body); // Parse the request body
        const newTask = new Task(newTaskData);
        await newTask.save(); // Assuming newTask.save() exists
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
        const updatedTask = await Task.findByIdAndUpdate(updateTaskId, updateData, { new: true }); // Assuming findByIdAndUpdate exists
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
        const deletedTask = await Task.findByIdAndDelete(deleteTaskId); // Assuming findByIdAndDelete exists
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