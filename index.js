import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const typeDefs = `#graphql
    type Project {
        ID: String
        name: String
        description: String
        objCode: String
        percentComplete: String
        plannedCompletionDate: String
        plannedStartDate: String
        priority: String
        projectedCompletionDate: String
        status: String
    }

    type Task {
        projectID: String
        name: String
        objCode: String
        status: String
        assignedToID: String
        priority: String
    }

    type Query {
        getProjects(ownerID: String): [Project]
        getTasksById(projectID: String): [Task]
    }

    type Mutation {
        createProject(name: String, description: String, objCode: String = "PROJ", percentComplete: String, plannedCompletionDate: String,
                      plannedStartDate: String, priority: String, projectedCompletionDate: String, status: String): Project
        createTask(projectID: String, name: String, objCode: String = "PROJ", status: String, assignedToID: String = null,
                      priority: String): Task
    }
`;

const resolvers = {
    Query: {
        getProjects: async (_, { ownerID }) => {
            try {
                const response = await axios.get(`${API_URL}/proj/search`, {
                    params: { ownerID },
                    headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
                });
        
                // Asegurar que response.data.data es un array, o retornar []
                return Array.isArray(response.data.data) ? response.data.data : [];
            } catch (error) {
                console.error('Error Fetching projects', error);
                return [];
            }
        },     
        getTasksById: async (_, { projectID }) => {
            try {
                const response = await axios.get(`${API_URL}/task/search`, {
                    params: { projectID },
                    headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
                });
                
                return response.data.data || [];
            } catch (error) {
                console.error('Error Fetching tasks', error);
                return [];
            }
        }
    },

    Mutation: {
        createProject: async (_, {name, objCode, description,  percentComplete, plannedCompletionDate, plannedStartDate, priority,
                            projectedCompletionDate, status  }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/proj`,
                    { name, objCode, description,  percentComplete, plannedCompletionDate, plannedStartDate, priority,
                        projectedCompletionDate, status },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data; // Retornar el proyecto creado
            } catch (error) {
                console.error('Error Creating project', error);
                return null;
            }
        },

        createTask: async (_, {projectID, name, objCode, status, assignedToID, priority }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/task`,
                    { projectID, name, objCode, status, assignedToID, priority },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data; // Retornar la tarea creada
            } catch (error) {
                console.error('Error Creating task', error);
                return null;
            }
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);
