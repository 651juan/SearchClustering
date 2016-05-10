import os

# Load file storing all results
resultsFile = open("results.log", 'r')
line = resultsFile.readline()

# Create a file object (hack)
currentTestFile = open("results.log", 'r')
currentTestFile.close()

# List to store the names of all files created
fileList = []

# Create data directory if it does not exist
try:
    os.makedirs('data')
except OSError as exception:
    print "Error creating data directory"
    
while line:
    # Read information about the results and create file for it
    if line == "----------\n":
        epochs = resultsFile.readline()
        learningRate = resultsFile.readline()
        networkWidth = resultsFile.readline()        
        line = resultsFile.readline()

        epochs = epochs.split()[1]
        learningRate = learningRate.split()[2]
        networkWidth = networkWidth.split()[2]

        fileName = "data/som-"+epochs+"-"+learningRate+"-"+networkWidth+"-results.txt"
        fileList.append(fileName)
        if not currentTestFile.closed:
            currentTestFile.close()
            
        currentTestFile = open(fileName, 'w')
    # Write line to file if it is part of the actual results
    else:
        if line != "\n":
            currentTestFile.write(line)
    
    line = resultsFile.readline()

# Close open files
currentTestFile.close()
resultsFile.close()

# Create file with list of names of created files
fileListFile = open("filelist.txt", 'w')
for fileName in fileList:
    fileListFile.write(fileName+"\n")
fileListFile.close()

# Done :)
print "Results files created."
