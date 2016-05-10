import os
import csv
import shutil
import subprocess

# Create logs directory if it does not exist
try:
    os.makedirs('logs')
except OSError as exception:
    print "Error creating logs directory"
    
# Create results directory if it does not exist
try:
    os.makedirs('results')
except OSError as exception:
    print "Error creating results directory"

with open("globalResults.csv", 'wb') as globalResultsFile:
    globalResultsWriter = csv.writer(globalResultsFile, dialect='excel')
    globalResultsWriter.writerow(['Epochs', 'Learning Rate', 'Network Width', 'Average F1', 'Average Rand Index', 'Average Adj Rand Index', 'Average Jaccard Index', 'Average Number of Clusters', 'Average Cluster Size'])
    # For each file in filelist run evaluator and copy log file into logs
    with open("filelist.txt", 'r') as fileList:
        for fileName in fileList:
            # Get test parameters
            fileName = fileName.split('\n')[0]
            paramList = fileName.split('-')
            epochs = paramList[1]
            learningRate = paramList[2]
            networkWidth = paramList[3]

            # Get file names for logs and results
            logFileName = "logs/som-"+epochs+"-"+learningRate+"-"+networkWidth+"-log.txt"
            resultsFileName = "results/som-"+epochs+"-"+learningRate+"-"+networkWidth+"-result.txt"
            
            # Evaluate test
            subprocess.call(['java', '-jar', 'WSI-Evaluator.jar', 'dataset', fileName])
            
            # Store logs and results
            shutil.copy("wsi_eval.log", logFileName)
            shutil.copy("result.log", resultsFileName)

            # Extract results
            averageF1 = ""
            averageRandIndex = ""
            averageAdjRandIndex = ""
            averageJaccardIndex = ""
            averageNumberOfClusters = ""
            averageClusterSize = ""
            with open("result.log", 'r') as logFile:
                for line in logFile:
                    if "average F1 = " in line:
                        averageF1 = line.split(" = ")[1].split('\n')[0]
                    if "average Rand Index = " in line:
                        averageRandIndex = line.split(" = ")[1].split('\n')[0]
                    if "average Adj Rand Index = " in line:
                        averageAdjRandIndex = line.split(" = ")[1].split('\n')[0]
                    if "average Jaccard Index = " in line:
                        averageJaccardIndex = line.split(" = ")[1].split('\n')[0]
                    if "average number of created clusters: " in line:
                        averageNumberOfClusters = line.split(": ")[1].split('\n')[0]
                    if "average cluster size: " in line:
                        averageClusterSize = line.split(": ")[1].split('\n')[0]
            
            globalResultsWriter.writerow([epochs, learningRate, networkWidth, averageF1, averageRandIndex, averageAdjRandIndex, averageJaccardIndex, averageNumberOfClusters, averageClusterSize])

# Done :)
print "Results evaluated."
