import os
import shutil
import subprocess

# Create logs directory if it does not exist
try:
    os.makedirs('logs')
except OSError as exception:
    print "Error creating logs directory"
    
# For each file in filelist run evaluator and copy log file into logs
with open("filelist.txt", 'r') as fileList:
    for fileName in fileList:
        fileName = fileName.split('\n')[0]
        paramList = fileName.split('-')
        epochs = paramList[1]
        learningRate = paramList[2]
        networkWidth = paramList[3]
        logFileName = "logs/som-"+epochs+"-"+learningRate+"-"+networkWidth+"-log.txt"
        subprocess.call(['java', '-jar', 'WSI-Evaluator.jar', 'dataset', fileName])
        shutil.copy("wsi_eval.log", logFileName)

# Done :)
print "Results evaluated."
