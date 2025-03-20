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

    type SubTask {
        name: String
        description: String
        status: String
        projectID: String
        parentID: String
    }

    type Task {
        projectID: String
        name: String
        objCode: String
        status: String
        assignedToID: String
        priority: String
    }

    type IssueProject{
        projectID: String
        name: String
        description: String
        status: String
        priority: String
    }

    type Category{
        ID: String
        name: String
        objCode: String
        customerID: String
    }

    type AssignedCategoryToProject{
        projectID: String
        categoryID: String
    }

    type AssignedCategoryToTask{
        taskID: String
        categoryID: String
    }

    type IssueTask{
        projectID: String
        name: String
        description: String
        status: String
        priority: String
        opTaskType: String
        assignedToID: String
        sourceObjID: String
        sourceObjCode: String
    }

    type Note{
        noteText: String
        objID: String
        noteObjCode: String
    }

    type User{
        ID: String
        name: String
        objCode: String
        username: String
    }

    type Query {
        getProjects(ownerID: String): [Project]
        getTasksById(projectID: String): [Task]
        getUserById(ID: String): [User]
        getAllCategories: [Category]
    }

    type Mutation {
        createProject(name: String, description: String, objCode: String = "PROJ", percentComplete: String, plannedCompletionDate: String,
        plannedStartDate: String, priority: String, projectedCompletionDate: String, status: String): Project

        createTask(projectID: String, name: String, objCode: String = "PROJ", status: String, assignedToID: String = null,
        priority: String): Task

        createSubTask(projectID: String, name: String, description: String, status: String, parentID: String): SubTask

        createIssueProject(projectID: String, name: String, description: String, status: String, priority: String): IssueProject
        
        createIssueTask(projectID: String, name: String, description: String, status: String, priority: String, opTaskType: String = "ISU",
        assignedToID: String = null, sourceObjID: String, sourceObjCode: String = "TASK"): IssueTask

        AssignedCategoryToProject(projectID: String, categoryID: String): AssignedCategoryToProject

        AssignedCategoryToTask(taskID: String, categoryID: String): AssignedCategoryToTask

        createNote(noteText: String, objID: String, noteObjCode: String = "TASK"): Note
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
        },
        getUserById: async (_, { ID }) => {
            try {
                const response = await axios.get(`${API_URL}/user/search`, {
                    params: {
                        ID,
                        fields: 'username'
                    },
                    headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
                });

                return Array.isArray(response.data.data) ? response.data.data : [];
            } catch (error) {
                console.error('Error Fetching user', error);
                return [];
            }
        },
        getAllCategories: async () => {
            try {
                const response = await axios.get(`${API_URL}/category/search`, {
                    headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY }
                });
                return response.data.data || [];
            } catch (error) {
                console.error('Error Fetching categories', error);
                return [];
            }
        }

    },

    Mutation: {
        createProject: async (_, { name, objCode, description, percentComplete, plannedCompletionDate, plannedStartDate, priority,
            projectedCompletionDate, status }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/proj`,
                    {
                        name, objCode, description, percentComplete, plannedCompletionDate, plannedStartDate, priority,
                        projectedCompletionDate, status
                    },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data.data;
            } catch (error) {
                console.error('Error Creating project', error);
                return null;
            }
        },

        createTask: async (_, { projectID, name, objCode, status, assignedToID, priority }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/task`,
                    { projectID, name, objCode, status, assignedToID, priority },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data.data;
            } catch (error) {
                console.error('Error Creating task', error);
                return null;
            }
        },
        createSubTask: async (_, { projectID, name, description, status, parentID }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/task`,
                    { projectID, name, description, status, parentID },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data.data;
            } catch (error) {
                console.error('Error Creating subtask', error);
                return null;
            }
        },
        createIssueTask: async (_, { projectID, name, description, status, priority, opTaskType, assignedToID, sourceObjID, sourceObjCode }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/issue`,
                    { projectID, name, description, status, priority, opTaskType, assignedToID, sourceObjID, sourceObjCode },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data.data;
            } catch (error) {
                console.error('Error Creating issue task', error);
                return null;
            }
        },
        createIssueProject: async (_, { projectID, name, description, status, priority }) => {
            try {
                const response = await axios.post(
                    `${API_URL}/issue`,
                    { projectID, name, description, status, priority },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return response.data.data;
            } catch (error) {
                console.error('Error Creating issue project', error);
                return null;
            }
        },
        AssignedCategoryToProject: async (_, { projectID, categoryID }) => {
            try {
                await axios.put(
                    `${API_URL}/proj/${projectID}`,
                    { categoryID },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return { projectID, categoryID };
            } catch (error) {
                console.error('Error Assigning category to project', error);
                return null;
            }
        },
        AssignedCategoryToTask: async (_, { taskID, categoryID }) => {
            try {
                await axios.put(
                    `${API_URL}/task/${taskID}`,
                    { categoryID },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return { taskID, categoryID };
            } catch (error) {
                console.error('Error Assigning category to task', error);
                return null;
            }
        },
        createNote: async (_, { noteText, objID, noteObjCode }) => {
            try {
                await axios.post(
                    `${API_URL}/note`,
                    { noteText, objID, noteObjCode },
                    { headers: { 'Content-Type': 'application/json', 'apiKey': API_KEY } }
                );
                return { noteText, objID, noteObjCode };
            } catch (error) {
                console.error('Error Creating note', error);
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
