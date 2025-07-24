# Step 1: Use a Node.js base image
FROM node:22
RUN apt-get update
# RUN apt-get install default-jdk
RUN apt-get install sudo
RUN sudo apt-get install python3
RUN sudo apt-get install -y default-jdk
# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy the application files
COPY package*.json ./

COPY . .
RUN ls -a

# Step 4: Install dependencies
RUN npm install

# Step 5: Expose the server port
EXPOSE 5000

# Step 6: Start the express server
CMD ["node", "Server.js"]
